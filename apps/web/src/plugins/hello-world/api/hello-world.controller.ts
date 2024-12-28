import { Allow, AssetService, CollectionService, Ctx, JobPost, Permission, RequestContext } from '@firelancer/core';
import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('hello-world')
export class HelloWorldController {
    constructor(
        private readonly assetService: AssetService,
        private readonly collectionService: CollectionService,
    ) {}

    @Get()
    @Allow(Permission.Public)
    custom() {
        return 'Hello world!';
    }

    @Get('/collections')
    @Allow(Permission.Public)
    async collections(@Ctx() ctx: RequestContext) {
        return this.collectionService.findAll(ctx);
    }

    @Get('/collections/:id')
    @Allow(Permission.Public)
    async collection(@Ctx() ctx: RequestContext, @Param('id') id: number) {
        return this.collectionService.findOne(ctx, id);
    }

    @Get('/collections/:id/jobs')
    @Allow(Permission.Public)
    async collectionJobsById(@Ctx() ctx: RequestContext, @Param('id') id: number) {
        const collection = await this.collectionService.findOne(ctx, id);
        return this.collectionService.getCollectionCollectableIds(collection, JobPost, ctx);
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@Ctx() ctx: RequestContext, @UploadedFile() file: Express.Multer.File) {
        file.filename = file.originalname;
        return this.assetService.create(ctx, { file });
    }
}
