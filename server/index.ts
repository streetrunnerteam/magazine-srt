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

const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:3000',
            'https://magazine-srt-client.vercel.app',
            'https://magazine-srt-f8pv.vercel.app'
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin) || /\.vercel\.app$/.test(origin)) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
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
