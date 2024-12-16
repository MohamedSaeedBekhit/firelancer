import { Allow, AssetService, Ctx, Permission, RequestContext } from '@firelancer/core';
import { Controller, Get, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('hello-world')
export class HelloWorldController {
  constructor(private readonly assetService: AssetService) {}

  @Get()
  @Allow(Permission.Public)
  custom() {
    return 'Hello world!';
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(@Ctx() ctx: RequestContext, @UploadedFile() file: Express.Multer.File) {
    file.filename = file.originalname;
    return this.assetService.create(ctx, { file });
  }
}
