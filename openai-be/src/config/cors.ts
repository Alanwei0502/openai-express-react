import { CorsOptions, CorsOptionsDelegate, CorsRequest } from 'cors';

const whitelist = [process.env.CLIENT];

const corsOptionsDelegate: CorsOptionsDelegate = function (
  req: CorsRequest,
  callback: (error: Error | null, options: CorsOptions) => void,
){
  let corsOptions: CorsOptions;
  let error = null;
  const isDomainAllowed = whitelist.includes(req.headers['origin']);
  console.log({
    isDomainAllowed,
    whitelist,
    reqHeaders: req.headers,
  });

  if (isDomainAllowed) {
    corsOptions = { origin: true };
  }else{
    corsOptions = { origin: false };
    error = new Error('Not allowed by CORS');
  }

  corsOptions.methods = "GET, PUT, PATCH, POST, DELETE, OPTIONS";
  callback(error, corsOptions);
};

export default corsOptionsDelegate;