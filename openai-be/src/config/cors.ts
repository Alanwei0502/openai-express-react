import { CorsOptions, CorsOptionsDelegate, CorsRequest } from 'cors';

const whitelist = [process.env.CLIENT];

const corsOptionsDelegate: CorsOptionsDelegate = function (
  req: CorsRequest,
  callback: (error: Error | null, options: CorsOptions) => void,
){
  let corsOptions: CorsOptions;
  let error = null;

  const origin = req.headers['origin'] || '';
  const isDomainAllowed = whitelist.includes(origin);
  console.log({
    isDomainAllowed,
    whitelist,
    origin,
    host: req.headers['host'],
  });

  if (isDomainAllowed) {
    corsOptions = { origin: true };
  }else{
    corsOptions = { origin: false };
    error = new Error('Not allowed by CORS');
  }

  callback(error, corsOptions);
};

export default corsOptionsDelegate;