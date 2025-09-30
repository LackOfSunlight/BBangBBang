import { Socket } from 'net';
import bbangLogicOverflowTest from '../jmeter.test.ts/bbang.logic.overflow';

const jmeterTestHandler = (socket: Socket, command: string) => {
	if (command === 'bbang') {
		bbangLogicOverflowTest();
	}
};

export default jmeterTestHandler;
