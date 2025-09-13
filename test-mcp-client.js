// test-mcp-client.js
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function main() {
  // 创建传输层，直接指定服务器命令
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['src/server/mcp-server.js']
  });

  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0'
    },
    {
      capabilities: {
        tools: {},
        resources: {}
      }
    }
  );

  await client.connect(transport);
  console.log('✅ 已连接到 MCP Server');

  // 1. 列出可用工具
  const toolsResponse = await client.listTools({});
  console.log('🛠️ 可用工具:', toolsResponse.tools.map(t => t.name));

  // 2. 测试调用工具 - 获取天气
  const weatherResponse = await client.callTool({
    name: 'get_weather',
    arguments: { city: '广州' }
  });
  console.log('🌤️ 天气返回:', weatherResponse);

  // 3. 测试调用工具 - 搜索航班
  const flightsResponse = await client.callTool({
    name: 'search_flights',
    arguments: {
      origin: '广州',
      destination: '上海',
      date: '2025-10-01'
    }
  });
  console.log('✈️ 航班返回:', flightsResponse);

  // 4. 测试调用工具 - 搜索景点
  const placesResponse = await client.callTool({
    name: 'search_places',
    arguments: {
      location: '广州',
      type: 'tourist_attraction'
    }
  });
  console.log('🏯 景点返回:', placesResponse);

  // 关闭连接
  client.close();
}

main().catch(err => {
  console.error('❌ 出错:', err);
});
