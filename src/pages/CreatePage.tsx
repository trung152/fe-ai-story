import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStory } from '../api';

const GENRES = [
    { value: 'fantasy', label: '🗡️ Fantasy' },
    { value: 'kiếm hiệp', label: '⚔️ Kiếm hiệp' },
    { value: 'horror', label: '👻 Horror' },
    { value: 'romance', label: '💕 Romance' },
    { value: 'sci-fi', label: '🚀 Sci-Fi' },
    { value: 'thriller', label: '🔍 Thriller' },
    { value: 'adventure', label: '🏔️ Adventure' },
];

export default function CreatePage() {
    const [title, setTitle] = useState('');
    const [genre, setGenre] = useState('fantasy');
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!title.trim() || !prompt.trim()) return;

        setLoading(true);
        setError('');

        try {
            const result = await createStory(title.trim(), genre, prompt.trim());
            navigate(`/story/${result.story.id}/continue`);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <h1 className="page-title">Tạo truyện mới</h1>
            <p className="page-subtitle">Mô tả ý tưởng để AI bắt đầu sáng tạo</p>

            {error && <div className="error-msg">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Tên truyện</label>
                    <input
                        id="title"
                        className="form-input"
                        placeholder="Ví dụ: Kiếm Phong Lệnh"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="genre">Thể loại</label>
                    <select
                        id="genre"
                        className="form-select"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                    >
                        {GENRES.map((g) => (
                            <option key={g.value} value={g.value}>{g.label}</option>
                        ))}
                    </select>
                </div>

                <div className="form-group">
                    <label htmlFor="prompt">Ý tưởng ban đầu</label>
                    <textarea
                        id="prompt"
                        className="form-textarea"
                        placeholder="Mô tả bối cảnh, nhân vật, và sự kiện khởi đầu..."
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        minLength={10}
                        required
                    />
                </div>

                <div className="actions">
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? '✨ Đang tạo...' : '✦ Bắt đầu viết truyện'}
                    </button>
                    <button type="button" className="btn btn-ghost" onClick={() => navigate('/')}>
                        ← Quay lại
                    </button>
                </div>
            </form>
        </>
    );
}
