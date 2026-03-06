import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readStory, continueStory, type Chapter, type Direction } from '../api';

export default function ContinuePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const bottomRef = useRef<HTMLDivElement>(null);

    const [title, setTitle] = useState('');
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [directions, setDirections] = useState<Direction[]>([]);
    const [customInput, setCustomInput] = useState('');
    const [writing, setWriting] = useState(false);
    const [error, setError] = useState('');
    const [initialLoad, setInitialLoad] = useState(true);

    // Load full story + lastDirections from API on mount
    useEffect(() => {
        if (!id) return;

        async function loadAll() {
            try {
                const allChapters: Chapter[] = [];
                let cursor: number | undefined;
                let more = true;
                let savedDirections: Direction[] = [];

                while (more) {
                    const data = await readStory(id!, { after: cursor, limit: 50 });
                    setTitle(data.story.title);
                    allChapters.push(...data.chapters);
                    cursor = data.nextCursor ?? undefined;
                    more = data.hasMore;
                    // Get lastDirections from first read call
                    if (savedDirections.length === 0 && data.lastDirections?.length > 0) {
                        savedDirections = data.lastDirections;
                    }
                }

                setChapters(allChapters);
                setDirections(savedDirections);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Lỗi');
            } finally {
                setInitialLoad(false);
            }
        }

        loadAll();
    }, [id]);

    // Scroll to bottom when new chapter added
    useEffect(() => {
        if (!initialLoad) {
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chapters.length, initialLoad]);

    async function handleContinue(userInput: string) {
        if (!id || !userInput.trim() || writing) return;

        setWriting(true);
        setError('');
        setDirections([]);
        setCustomInput('');

        try {
            const result = await continueStory(id, userInput.trim());
            setChapters((prev) => [
                ...prev,
                {
                    turn: result.turnNumber,
                    title: `Chương ${result.turnNumber}`,
                    content: result.aiOutput,
                },
            ]);
            setDirections(result.nextDirections);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi khi viết tiếp');
        } finally {
            setWriting(false);
        }
    }

    function handleCustomSubmit(e: React.FormEvent) {
        e.preventDefault();
        handleContinue(customInput);
    }

    if (initialLoad) return (
        <div className="loading">
            <div className="spinner" />
            <p>Đang tải truyện...</p>
        </div>
    );

    return (
        <>
            <div className="actions-between">
                <div>
                    <h1 className="page-title">{title}</h1>
                    <p className="page-subtitle">Chế độ viết tiếp</p>
                </div>
                <button className="btn btn-ghost" onClick={() => navigate(`/story/${id}`)}>
                    📖 Đọc truyện
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {/* Story content */}
            {chapters.map((ch) => (
                <div key={ch.turn} className="chapter">
                    <div className="chapter-title">{ch.title}</div>
                    <div className="chapter-content">{ch.content}</div>
                </div>
            ))}

            {/* Writing indicator */}
            {writing && (
                <div className="writing-indicator">
                    <div className="writing-dots">
                        <span /><span /><span />
                    </div>
                    AI đang viết tiếp...
                </div>
            )}

            {/* Directions + Custom input */}
            {!writing && (
                <div style={{ marginTop: 32 }}>
                    <p style={{ color: 'var(--text-dim)', marginBottom: 12, fontSize: '0.9rem' }}>
                        {directions.length > 0 ? 'Chọn hướng đi tiếp theo:' : chapters.length > 0 ? 'Nhập hướng đi để viết tiếp:' : 'Nhập hướng đi để bắt đầu:'}
                    </p>

                    {directions.length > 0 && (
                        <div className="directions">
                            {directions.map((d) => (
                                <button
                                    key={d.id}
                                    className="direction-btn"
                                    onClick={() => handleContinue(d.text)}
                                    disabled={writing}
                                >
                                    <span className="direction-label">{d.label}</span>
                                    <span>{d.text}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <form onSubmit={handleCustomSubmit} style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <input
                                className="form-input"
                                placeholder="Hoặc nhập ý của bạn..."
                                value={customInput}
                                onChange={(e) => setCustomInput(e.target.value)}
                                disabled={writing}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={writing || !customInput.trim()}
                                style={{ flexShrink: 0 }}
                            >
                                Viết ✍️
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div ref={bottomRef} />

            <div className="actions" style={{ marginTop: 32 }}>
                <button className="btn btn-ghost" onClick={() => navigate('/')}>
                    ← Về trang chủ
                </button>
            </div>
        </>
    );
}
