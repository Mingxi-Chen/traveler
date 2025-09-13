import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { CONFIG } from '../config/api-config.js';
import { TravelAPIService } from './api-service.js';
import { TravelPlannerEngine } from './planner-engine.js';

class TravelAssistantMCPServer {
    constructor() {
      this.server = new Server(
        {
          name: 'travel-assistant-mcp',
          version: '1.0.0',
        },
        {
          capabilities: {
            resources: {},
            tools: {},
          },
        }
      );
  
      this.apiService = new TravelAPIService();
      this.plannerEngine = new TravelPlannerEngine(this.apiService);
      
      this.setupHandlers();
    }
  
    setupHandlers() {
      // 工具列表处理器
      this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
        tools: [
          {
            name: 'create_travel_plan',
            description: '创建完整的旅行计划，包括航班、住宿、景点、餐厅等',
            inputSchema: {
              type: 'object',
              properties: {
                destination: {
                  type: 'string',
                  description: '目的地城市'
                },
                origin: {
                  type: 'string',
                  description: '出发城市'
                },
                startDate: {
                  type: 'string',
                  description: '开始日期 (YYYY-MM-DD)'
                },
                endDate: {
                  type: 'string',
                  description: '结束日期 (YYYY-MM-DD)'
                },
                budget: {
                  type: 'number',
                  description: '预算（人民币）'
                },
                interests: {
                  type: 'array',
                  items: { type: 'string' },
                  description: '兴趣爱好'
                },
                travelStyle: {
                  type: 'string',
                  enum: ['budget', 'balanced', 'luxury'],
                  description: '旅行风格'
                }
              },
              required: ['destination', 'origin', 'startDate', 'endDate']
            }
          },
          {
            name: 'get_weather',
            description: '获取指定城市的天气信息',
            inputSchema: {
              type: 'object',
              properties: {
                city: {
                  type: 'string',
                  description: '城市名称'
                }
              },
              required: ['city']
            }
          },
          {
            name: 'search_places',
            description: '搜索景点、餐厅或酒店',
            inputSchema: {
              type: 'object',
              properties: {
                location: {
                  type: 'string',
                  description: '位置'
                },
                type: {
                  type: 'string',
                  enum: ['tourist_attraction', 'restaurant', 'hotel'],
                  description: '地点类型'
                }
              },
              required: ['location', 'type']
            }
          },
          {
            name: 'search_flights',
            description: '搜索航班信息',
            inputSchema: {
              type: 'object',
              properties: {
                origin: {
                  type: 'string',
                  description: '出发地'
                },
                destination: {
                  type: 'string',
                  description: '目的地'
                },
                date: {
                  type: 'string',
                  description: '日期 (YYYY-MM-DD)'
                }
              },
              required: ['origin', 'destination', 'date']
            }
          },
          {
            name: 'translate',
            description: '翻译常用旅行短语',
            inputSchema: {
              type: 'object',
              properties: {
                text: {
                  type: 'string',
                  description: '要翻译的文本'
                },
                targetLang: {
                  type: 'string',
                  description: '目标语言代码'
                }
              },
              required: ['text']
            }
          },
          {
            name: 'optimize_plan',
            description: '优化现有的旅行计划',
            inputSchema: {
              type: 'object',
              properties: {
                planId: {
                  type: 'string',
                  description: '计划ID'
                },
                preferences: {
                  type: 'object',
                  properties: {
                    prioritizeHighRated: {
                      type: 'boolean',
                      description: '优先高评分景点'
                    },
                    saveMoney: {
                      type: 'boolean',
                      description: '节省预算'
                    }
                  }
                }
              },
              required: ['planId']
            }
          }
        ]
      }));
  
      // 工具调用处理器
      this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
        const { name, arguments: args } = request.params;
  
        try {
          switch (name) {
            case 'create_travel_plan':
              const plan = await this.plannerEngine.createTravelPlan(args);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(plan, null, 2)
                  }
                ]
              };
  
            case 'get_weather':
              const weather = await this.apiService.getWeather(args.city);
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(weather, null, 2)
                  }
                ]
              };
  
            case 'search_places':
              const places = await this.apiService.searchPlaces(
                args.location,
                args.type
              );
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(places, null, 2)
                  }
                ]
              };
  
            case 'search_flights':
              const flights = await this.apiService.searchFlights(
                args.origin,
                args.destination,
                args.date
              );
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(flights, null, 2)
                  }
                ]
              };
  
            case 'translate':
              const translation = await this.apiService.translate(
                args.text,
                args.targetLang
              );
              return {
                content: [
                  {
                    type: 'text',
                    text: translation
                  }
                ]
              };
  
            case 'optimize_plan':
              const optimizedPlan = await this.plannerEngine.optimizePlan(
                args.planId,
                args.preferences || {}
              );
              return {
                content: [
                  {
                    type: 'text',
                    text: JSON.stringify(optimizedPlan, null, 2)
                  }
                ]
              };
  
            default:
              throw new Error(`未知的工具: ${name}`);
          }
        } catch (error) {
          return {
            content: [
              {
                type: 'text',
                text: `错误: ${error.message}`
              }
            ],
            isError: true
          };
        }
      });
  
      // 资源列表处理器
      this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({
        resources: [
          {
            uri: 'travel://current-plan',
            name: '当前旅行计划',
            description: '查看当前的旅行计划详情',
            mimeType: 'application/json'
          },
          {
            uri: 'travel://cache-stats',
            name: '缓存统计',
            description: '查看API缓存统计信息',
            mimeType: 'application/json'
          }
        ]
      }));
  
      // 资源读取处理器
      this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
        const { uri } = request.params;
  
        switch (uri) {
          case 'travel://current-plan':
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify(
                    this.plannerEngine.currentPlan || { message: '暂无计划' },
                    null,
                    2
                  )
                }
              ]
            };
  
          case 'travel://cache-stats':
            return {
              contents: [
                {
                  uri,
                  mimeType: 'application/json',
                  text: JSON.stringify({
                    cacheSize: this.apiService.cache.cache.size,
                    maxSize: CONFIG.cache.maxSize,
                    ttl: CONFIG.cache.ttl
                  }, null, 2)
                }
              ]
            };
  
          default:
            throw new Error(`未知的资源: ${uri}`);
        }
      });
    }
  
    async run() {
      const transport = new StdioServerTransport();
      await this.server.connect(transport);
      console.error('MCP服务器已启动');
    }
}


if (import.meta.url === `file://${process.argv[1]}`) {
    const server = new TravelAssistantMCPServer();
    server.run().catch(console.error);
  }
  
  export { TravelAssistantMCPServer };