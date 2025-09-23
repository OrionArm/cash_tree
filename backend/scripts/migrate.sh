#!/bin/bash

# Устанавливаем переменные окружения для подключения к PostgreSQL в Docker
export POSTGRES_HOST=postgres
export POSTGRES_PORT=5432
export POSTGRES_USER=postgres
export POSTGRES_PASSWORD=ibe%Qdwwe
export POSTGRES_DB=financial_road

# Применяем миграции
pnpm run db:migrate
