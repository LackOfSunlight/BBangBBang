// server.ts
import { createServer } from 'net';
import onConnection from './sockets/on.connection.js';
import { cleanupAllTokens } from './services/token.cleanup.service.js';
import dotenv from 'dotenv';
import onJmeterConnection from './sockets/on.jmeter.connection.js';

dotenv.config();

const PORT = 3000;

const JMETER_PORT = 4000;

const server = createServer(onConnection);

const jmeterServer = createServer(onJmeterConnection);

// 서버 시작 시 토큰 정리
const initializeServer = async () => {
	try {
		await cleanupAllTokens();
	} catch (error) {
		process.exit(1);
	}
};

// 서버 실행
server.listen(PORT, async () => {
	console.log(`:로켓: TCP 서버 실행 중 : 포트 ${PORT}`);
	await initializeServer();
});

jmeterServer.listen(JMETER_PORT, async () => {
	console.log(`Jmeter 테스트 서버 : 포트 ${JMETER_PORT}`);
});
