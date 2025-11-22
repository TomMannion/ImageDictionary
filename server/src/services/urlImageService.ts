import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { URL } from 'url';

export const fetchImageFromUrl = async (imageUrl: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    try {
      const parsedUrl = new URL(imageUrl);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      // Generate temp file path
      const ext = path.extname(parsedUrl.pathname) || '.jpg';
      const tempFileName = `url-${Date.now()}${ext}`;
      const tempPath = path.join(__dirname, '../../uploads', tempFileName);

      const file = fs.createWriteStream(tempPath);

      protocol.get(imageUrl, (response) => {
        // Check if response is successful
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to fetch image: ${response.statusCode}`));
          return;
        }

        // Check content type
        const contentType = response.headers['content-type'];
        if (!contentType?.startsWith('image/')) {
          reject(new Error('URL does not point to an image'));
          return;
        }

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          resolve(tempPath);
        });

        file.on('error', (err) => {
          fs.unlink(tempPath, () => {}); // Clean up
          reject(err);
        });
      }).on('error', (err) => {
        fs.unlink(tempPath, () => {}); // Clean up
        reject(err);
      });
    } catch (error) {
      reject(error);
    }
  });
};
