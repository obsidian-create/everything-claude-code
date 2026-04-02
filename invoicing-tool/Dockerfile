FROM node:20-alpine

WORKDIR /app

# Install backend dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --production

# Install frontend dependencies and build
COPY frontend/package*.json ./frontend/
RUN cd frontend && npm install

COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# Copy backend source
COPY backend/ ./backend/

# Create uploads directory
RUN mkdir -p backend/uploads

EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

CMD ["node", "backend/server.js"]
