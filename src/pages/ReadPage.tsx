import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { readStory, type Chapter } from '../api';

export default function ReadPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('');
    const [totalTurns, setTotalTurns] = useState(0);
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [nextCursor, setNextCursor] = useState<number | null>(null);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState('');

    const loadChapters = useCallback(async (cursor?: number) => {
        if (!id) return;
        try {
            const data = await readStory(id, { after: cursor, limit: 10 });
            setTitle(data.story.title);
            setGenre(data.story.genre);
            setTotalTurns(data.story.totalTurns);
            setChapters((prev) => cursor !== undefined ? [...prev, ...data.chapters] : data.chapters);
            setNextCursor(data.nextCursor);
            setHasMore(data.hasMore);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Lỗi');
        }
    }, [id]);

    useEffect(() => {
        setLoading(true);
        loadChapters().finally(() => setLoading(false));
    }, [loadChapters]);

    async function handleLoadMore() {
        if (nextCursor === null) return;
        setLoadingMore(true);
        await loadChapters(nextCursor);
        setLoadingMore(false);
    }

    if (loading) return (
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
                    <p className="page-subtitle">{genre} · {totalTurns} chương</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate(`/story/${id}/continue`)}>
                    ✍️ Viết tiếp
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {chapters.length === 0 ? (
                <div className="empty-state">
                    <p>Truyện chưa có nội dung.</p>
                    <button className="btn btn-primary" onClick={() => navigate(`/story/${id}/continue`)}>
                        ✍️ Bắt đầu viết
                    </button>
                </div>
            ) : (
                <>
                    {chapters.map((ch) => (
                        <div key={ch.turn} className="chapter">
                            <div className="chapter-title">{ch.title}</div>
                            <div className="chapter-content">{ch.content}</div>
                        </div>
                    ))}

                    {hasMore && (
                        <div className="load-more-area">
                            <button
                                className="btn btn-secondary"
                                onClick={handleLoadMore}
                                disabled={loadingMore}
                            >
                                {loadingMore ? 'Đang tải...' : '↓ Tải thêm chương'}
                            </button>
                        </div>
                    )}
                </>
            )}

            <div className="actions" style={{ marginTop: 32 }}>
                <button className="btn btn-ghost" onClick={() => navigate('/')}>
                    ← Về trang chủ
                </button>
            </div>
        </>
    );
}
