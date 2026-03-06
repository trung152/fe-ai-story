import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { listStories, type Story } from '../api';

export default function HomePage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        listStories()
            .then(setStories)
            .catch((e) => setError(e.message))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="loading">
            <div className="spinner" />
            <p>Đang tải danh sách truyện...</p>
        </div>
    );

    return (
        <>
            <div className="actions-between">
                <div>
                    <h1 className="page-title">Thư viện truyện</h1>
                    <p className="page-subtitle">Khám phá những câu chuyện do AI sáng tạo</p>
                </div>
                <button className="btn btn-primary" onClick={() => navigate('/create')}>
                    ✦ Tạo truyện mới
                </button>
            </div>

            {error && <div className="error-msg">{error}</div>}

            {stories.length === 0 ? (
                <div className="empty-state">
                    <p>Chưa có truyện nào. Hãy tạo câu chuyện đầu tiên!</p>
                    <button className="btn btn-primary" onClick={() => navigate('/create')}>
                        ✦ Bắt đầu sáng tạo
                    </button>
                </div>
            ) : (
                stories.map((s) => (
                    <div key={s.id} className="card story-card" onClick={() => navigate(`/story/${s.id}`)}>
                        <h3>{s.title}</h3>
                        <div className="meta">
                            <span>📚 {s.genre}</span>
                            <span>📖 {s.totalTurns} chương</span>
                            <span>🕐 {new Date(s.createdAt).toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                ))
            )}
        </>
    );
}
