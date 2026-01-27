import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Booklyn API',
      version: '1.0.0',
      description: 'API documentation for Booklyn',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            role: { type: 'string', enum: ['librarian', 'client'] },
            avatar: { type: 'string', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            isActive: { type: 'boolean' },
          },
        },
        Book: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            title: { type: 'string' },
            author: { type: 'string' },
            category: { type: 'string' },
            isbn: { type: 'string' },
            totalCopies: { type: 'integer' },
            availableCopies: { type: 'integer' },
            coverImage: { type: 'string', nullable: true },
            description: { type: 'string', nullable: true },
            publishedYear: { type: 'integer', nullable: true },
          },
        },
        BorrowRecord: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            bookId: { type: 'string' },
            userId: { type: 'string' },
            status: { type: 'string', enum: ['reserved', 'borrowed', 'due_soon', 'overdue', 'returned'] },
            reservedAt: { type: 'string', format: 'date-time' },
            reservationExpiresAt: { type: 'string', format: 'date-time' },
            pickupDate: { type: 'string', format: 'date-time', nullable: true },
            dueDate: { type: 'string', format: 'date-time', nullable: true },
            returnDate: { type: 'string', format: 'date-time', nullable: true },
            overduesDays: { type: 'integer', nullable: true },
          },
        },
        Notification: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            userId: { type: 'string' },
            title: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string', enum: ['info', 'warning', 'success', 'error'] },
            read: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/**/*.ts'], // Path to the API docs
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
