import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { config } from './config';
import { connectDB, isMongoConnected } from './db/connection';
import apiRoutes from './routes';

const app = express();

app.use(cors({ origin: config.CORS_ORIGIN }));
app.use(express.json());

// Complete, self-contained OpenAPI 3.0 specification for guaranteed 100% Swagger UI availability
const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'NestFit — Multi-City Location Intelligence API',
    version: '1.0.0',
    description:
      'Multi-factor Pareto Optimization engine for lifestyle-driven neighborhood matching across Bangalore and Pune.'
  },
  servers: [
    {
      url: `http://localhost:${config.PORT}`,
      description: 'Development Server'
    }
  ],
  tags: [
    { name: 'System', description: 'Health and service checks' },
    { name: 'Recommendations', description: 'Pareto Optimization and Weighted Scoring' },
    { name: 'Neighborhoods', description: 'Micro-market spatial data and boundaries' },
    { name: 'Metadata', description: 'Cities, tech parks, and factors' }
  ],
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Check API service health & DB status',
        responses: {
          '200': {
            description: 'Service is healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    status: { type: 'string', example: 'healthy' },
                    service: { type: 'string' },
                    version: { type: 'string' },
                    mongoConnected: { type: 'boolean' }
                  }
                }
              }
            }
          }
        }
      }
    },
    '/api/v1/recommend': {
      post: {
        tags: ['Recommendations'],
        summary: 'Compute Pareto-optimal frontier or weighted scoring for lifestyle constraints',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['workplace'],
                properties: {
                  city: { type: 'string', enum: ['bangalore', 'pune'], default: 'bangalore' },
                  workplace: {
                    type: 'object',
                    required: ['lat', 'lon'],
                    properties: {
                      name: { type: 'string', example: 'RMZ Ecospace / Ecoworld (ORR)' },
                      lat: { type: 'number', example: 12.9279 },
                      lon: { type: 'number', example: 77.6848 }
                    }
                  },
                  transitMode: { type: 'string', enum: ['driving', 'transit'], default: 'driving' },
                  bedroomType: { type: 'string', enum: ['1bhk', '2bhk'], default: '1bhk' },
                  algorithm: { type: 'string', enum: ['pareto', 'weighted'], default: 'pareto' },
                  maxRent: { type: 'number', example: 30000 },
                  maxCommuteMinutes: { type: 'number', example: 45 },
                  maxAqi: { type: 'number', example: 90 },
                  minHospitals: { type: 'number', example: 5 },
                  minGroceries: { type: 'number', example: 10 },
                  paretoOnly: { type: 'boolean', default: false }
                }
              }
            }
          }
        },
        responses: {
          '200': {
            description: 'Pareto frontier and ranked results returned successfully'
          }
        }
      }
    },
    '/api/v1/neighborhoods': {
      get: {
        tags: ['Neighborhoods'],
        summary: 'List all micro-markets with GeoJSON polygons',
        parameters: [
          {
            in: 'query',
            name: 'city',
            schema: { type: 'string', enum: ['bangalore', 'pune'] },
            description: 'Filter neighborhoods by city'
          }
        ],
        responses: {
          '200': {
            description: 'Array of neighborhood objects with boundaries and benchmarks'
          }
        }
      }
    },
    '/api/v1/neighborhoods/{key}': {
      get: {
        tags: ['Neighborhoods'],
        summary: 'Get full profile of a specific neighborhood by key',
        parameters: [
          {
            in: 'path',
            name: 'key',
            required: true,
            schema: { type: 'string', example: 'koramangala' }
          }
        ],
        responses: {
          '200': { description: 'Neighborhood detail profile' },
          '404': { description: 'Neighborhood not found' }
        }
      }
    },
    '/api/v1/meta/cities': {
      get: {
        tags: ['Metadata'],
        summary: 'Retrieve list of supported cities with map coordinates and transit lines',
        responses: {
          '200': { description: 'Array of supported cities' }
        }
      }
    },
    '/api/v1/meta/workplaces': {
      get: {
        tags: ['Metadata'],
        summary: 'Get curated employment clusters and tech parks',
        parameters: [
          {
            in: 'query',
            name: 'city',
            schema: { type: 'string', enum: ['bangalore', 'pune'] },
            description: 'Filter tech parks by city'
          }
        ],
        responses: {
          '200': { description: 'Array of workplace tech parks' }
        }
      }
    },
    '/api/v1/meta/factors': {
      get: {
        tags: ['Metadata'],
        summary: 'Get factor definitions, units, directions, and data limitation disclosures',
        parameters: [
          {
            in: 'query',
            name: 'city',
            schema: { type: 'string', enum: ['bangalore', 'pune'] }
          }
        ],
        responses: {
          '200': { description: 'Factor definitions and safety exclusion note' }
        }
      }
    }
  }
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health Check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'NestFit Location-Intelligence API',
    version: '1.0.0',
    supportedCities: ['bangalore', 'pune'],
    mongoConnected: isMongoConnected(),
    environment: config.NODE_ENV
  });
});

// Root
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to NestFit Location-Intelligence API',
    docs: '/api-docs',
    endpoints: {
      recommendations: '/api/v1/recommend',
      neighborhoods: '/api/v1/neighborhoods',
      cities: '/api/v1/meta/cities',
      workplaces: '/api/v1/meta/workplaces',
      factors: '/api/v1/meta/factors'
    }
  });
});

// Mount V1 API
app.use('/api/v1', apiRoutes);

// Only listen if not imported by test runner
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(config.PORT, () => {
      console.log(`[NestFit Backend] Server running on http://localhost:${config.PORT}`);
      console.log(`[NestFit Backend] Swagger API Documentation available at http://localhost:${config.PORT}/api-docs`);
    });
  });
}

export default app;
