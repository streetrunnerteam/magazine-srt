import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

import authRoutes from './src/routes/authRoutes';
import userRoutes from './src/routes/userRoutes';
import feedRoutes from './src/routes/feedRoutes';
import gamificationRoutes from './src/routes/gamificationRoutes';
import notificationRoutes from './src/routes/notificationRoutes';
import postRoutes from './src/routes/postRoutes';
import inviteRoutes from './src/routes/inviteRoutes';

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:3000',
        'https://magazine-srt-client.vercel.app',
        'https://magazine-srt-f8pv.vercel.app',
        /\.vercel\.app$/
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import socialRoutes from './src/routes/socialRoutes';

// ... (existing imports)

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/feed', feedRoutes);
app.use('/gamification', gamificationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/posts', postRoutes);
app.use('/invites', inviteRoutes);
app.use('/social', socialRoutes);
import paymentRoutes from './src/routes/payment';
app.use('/api', paymentRoutes);
import announcementRoutes from './src/routes/announcementRoutes';
app.use('/announcements', announcementRoutes);

app.get('/', (req, res) => {
    res.json({ message: 'MAGAZINE API is running', status: 'active' });
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
}

export default app;
