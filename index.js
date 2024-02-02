import BinanceAJAX from './src/BinanceAJAX';
import BinanceStreams from './src/BinanceStreams';
import BinanceWS from './src/BinanceWS';
import BinanceSync from './src/BinanceSync';

BinanceSync.BinanceAJAX = BinanceAJAX;
BinanceSync.BinanceStreams = BinanceStreams;
BinanceSync.BinanceWS = BinanceWS;

export default BinanceSync;
