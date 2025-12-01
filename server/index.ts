import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Permissive CORS Configuration
app.use(cors({
    origin: '*', // Allow ALL origins
    credentials: false, // Disable credentials (cookies) since we use Bearer tokens
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Handle preflight for all routes
app.options(/.*/, cors({
    origin: '*',
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

import authRoutes from './src/routes/authRoutes';
import userRoutes from './src/routes/userRoutes';
import feedRoutes from './src/routes/feedRoutes';
import gamificationRoutes from './src/routes/gamificationRoutes';
import notificationRoutes from './src/routes/notificationRoutes';
import postRoutes from './src/routes/postRoutes';
import inviteRoutes from './src/routes/inviteRoutes';
import socialRoutes from './src/routes/socialRoutes';
import paymentRoutes from './src/routes/payment';
import announcementRoutes from './src/routes/announcementRoutes';

app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/feed', feedRoutes);
app.use('/gamification', gamificationRoutes);
app.use('/notifications', notificationRoutes);
app.use('/posts', postRoutes);
app.use('/invites', inviteRoutes);
app.use('/social', socialRoutes);
app.use('/api', paymentRoutes);
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
