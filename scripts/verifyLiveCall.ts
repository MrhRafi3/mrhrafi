import dotenv from 'dotenv';
import { ContextDevService } from '../src/services/contextDev.js';

dotenv.config();

async function main() {
  console.log('--- Context.dev Live Call Verification ---');
  console.log('Initializing ContextDevService wrapper...');

  const service = new ContextDevService();

  const targetUrl = 'https://example.com';
  console.log(`Executing 1 targeted live call to POST /web/scrape for ${targetUrl} (1 credit)...`);

  const startTime = Date.now();
  const response = await service.scrape({
    url: targetUrl,
    formats: { markdown: true },
    sharedParams: { mainContentOnly: true },
  });
  const duration = Date.now() - startTime;

  console.log('\n--- Live Call Succeeded! ---');
  console.log(`Execution Time: ${duration}ms`);
  console.log(`Request ID: ${response.request_id}`);
  console.log(`Status: Success`);
  console.log(`Page URL: ${response.url}`);
  console.log(`Title: ${response.metadata?.title}`);
  console.log(`Cache Status: ${response.cache_metadata?.status} (age: ${response.cache_metadata?.age_ms}ms)`);
  console.log(`Markdown Success: ${response.markdown?.success}`);
  console.log('\n--- Returned Markdown Preview ---');
  console.log(response.markdown?.data);
  console.log('---------------------------------');
  console.log('\nFull JSON Response:');
  console.log(JSON.stringify(response, null, 2));
}

main().catch((err) => {
  console.error('\nVerification call failed:');
  console.error(err);
  process.exit(1);
});
