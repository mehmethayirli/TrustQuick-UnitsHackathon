import { create } from 'ipfs-http-client';

const projectId = process.env.VITE_INFURA_PROJECT_ID;
const projectSecret = process.env.VITE_INFURA_PROJECT_SECRET;

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: auth,
  },
});

export async function uploadToIPFS(data: any) {
  try {
    const result = await client.add(JSON.stringify(data));
    return result.path;
  } catch (error) {
    console.error('Error uploading to IPFS:', error);
    return null;
  }
}

export async function getFromIPFS(hash: string) {
  try {
    const stream = client.cat(hash);
    const decoder = new TextDecoder();
    let data = '';
    
    for await (const chunk of stream) {
      data += decoder.decode(chunk, { stream: true });
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting from IPFS:', error);
    return null;
  }
}