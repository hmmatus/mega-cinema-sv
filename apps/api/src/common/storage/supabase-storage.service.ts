import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';

@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private readonly storage: ReturnType<typeof createClient>['storage'];

  constructor(private readonly config: ConfigService) {
    const client = createClient(
      config.getOrThrow('SUPABASE_URL'),
      config.getOrThrow('SUPABASE_SERVICE_ROLE_KEY'),
    );
    this.storage = client.storage;
  }

  async uploadPoster(fileName: string, fileBuffer: Buffer): Promise<string> {
    const bucket = 'cinema-storage';
    const hash = crypto.createHash('md5').update(fileBuffer).digest('hex');
    const path = `posters/${hash}-${fileName}`;

    try {
      const { error } = await this.storage.from(bucket).upload(path, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

      if (error) {
        this.logger.error(`Upload failed: ${error.message}`);
        throw error;
      }

      const { data } = this.storage.from(bucket).getPublicUrl(path);
      return data.publicUrl;
    } catch (err) {
      this.logger.error(`Upload error for ${fileName}: ${err}`);
      throw err;
    }
  }
}
