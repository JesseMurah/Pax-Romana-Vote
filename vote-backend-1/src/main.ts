import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.setGlobalPrefix('api/v1');

    app.enableCors({
        origin: ['http://localhost:3001', 'http://localhost:3000'], // Allow frontend port
        credentials: true,
    });

    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: false, // Disable strict validation temporarily
            transform: true,
        }),
    );

    const port = process.env.PORT || 3000;
    await app.listen(port);

    console.log(`🚀 Pax Romana KNUST API running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'dev'}`);
    console.log(`📅 Deadline: July 11th - ${new Date().toLocaleDateString()}`);
}

bootstrap();