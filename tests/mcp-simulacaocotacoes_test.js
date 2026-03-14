import { check, sleep } from 'k6';
import mcp from 'k6/x/mcp';
import { htmlReport } from "https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js";
import { textSummary } from "https://jslib.k6.io/k6-summary/0.0.2/index.js";

export const options = {
  thresholds: {
    checks: ['rate==1.0'],
  },
};

export default function () {
    const client = new mcp.StreamableHTTPClient({
        base_url: '#ENDPOINT_MCP#',
    });

    console.log('MCP (stdio) server running:', client.ping());

    console.log('Tools available:');
    const tools = client.listAllTools().tools;
    tools.forEach(tool => console.log(`  - ${tool.name}`));

    const toolResult1 = client.callTool({ name: 'obter_cotacao_dolar', arguments: { numberOfRecords: 3 } });
    console.log(`obter_cotacao_dolar tool - Response: "${toolResult1.content[0].text}"`);
    const objToolResult1 = JSON.parse(toolResult1.content[0].text);
    console.log(objToolResult1.message);

    const toolResult2 = client.callTool({ name: 'obter_cotacao_euro', arguments: { numberOfRecords: 4 } });
    console.log(`obter_cotacao_euro tool - Response: "${toolResult2.content[0].text}"`);
    const objToolResult2 = JSON.parse(toolResult2.content[0].text);
    console.log(objToolResult2.message);

    const toolResult3 = client.callTool({ name: 'obter_cotacao_libra', arguments: { numberOfRecords: 5 } });
    console.log(`obter_cotacao_libra tool - Response: "${toolResult3.content[0].text}"`);
    const objToolResult3 = JSON.parse(toolResult3.content[0].text);
    console.log(objToolResult3.message);

    check(objToolResult1, { 'obter_cotacao_dolar': (r) => r.isSuccess === true && r.data.moeda === 'Dolar (USD)' && r.data.valor > 0 });
    check(objToolResult2, { 'obter_cotacao_euro': (r) => r.isSuccess === true && r.data.moeda === 'Euro (EUR)' && r.data.valor > 0 });
    check(objToolResult3, { 'obter_cotacao_libra': (r) => r.isSuccess === true && r.data.moeda === 'Libra Esterlina (GBP)' && r.data.valor > 0 });
    sleep(1);
}

export function handleSummary(data) {
  return {
    "results-report.html": htmlReport(data),
    stdout: textSummary(data, { indent: " ", enableColors: true })
  };
}