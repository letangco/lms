import path from 'path';
import Express from 'express';
import i18n from 'i18n';
import cors from 'cors';
import compression from 'compression';
import bodyParser from 'body-parser';
import { CORS_OPTIONS } from '../config';
import errorHandler from './errorHandler';
import routeV1 from './v1';
import { DEFAULT_LANGUAGE } from '../constants';

const app = new Express();
// Note: All request handle use CORS must be write bellow CORS settings
app.use(cors(CORS_OPTIONS));
if (process.env.NODE_ENV === 'development') {
  app.use('/uploads', Express.static(path.resolve(__dirname, '../../uploads')));
}
app.use(compression());
app.use(
  Express.json({
      verify: (req, res, buf) => {
          req.rawBody = buf;
      },
  })
);
app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: false }));

// Multi Languages
i18n.configure({
  locales: ['en', 'vi'],
  directory: path.resolve(__dirname, '../../locales'),
  updateFiles: false,
  defaultLocale: DEFAULT_LANGUAGE,
});
app.use(i18n.init);
app.use((req, res, next) => {
  const language = req.header('Content-Language');
  req.lang = language || DEFAULT_LANGUAGE;
  next();
});

app.use('/v1', routeV1);

app.use(errorHandler);

export default app;
