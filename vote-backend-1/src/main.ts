import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api/v1');

    app.enableCors({
        origin: [
            'http://localhost:3001',
            'http://localhost:3000',
            'https://pax-romana-nom-3kon.vercel.app',
        ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
        allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false,
            transform: true,
        }),
    );

    const port = process.env.PORT;
    if (!port) {
        throw new Error('PORT environment variable is not set');
    }
    await app.listen(port);

    console.log(`🚀 Pax Romana KNUST API running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`📅 Deadline: July 11th - ${new Date().toLocaleDateString()}`);
}

bootstrap();