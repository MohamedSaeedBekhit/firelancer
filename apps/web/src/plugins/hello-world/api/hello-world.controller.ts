import {
    Allow,
    AssetService,
    BalanceEntryType,
    BalanceService,
    CollectionService,
    Ctx,
    CurrencyCode,
    CustomerService,
    EntityNotFoundError,
    JobPost,
    Permission,
    RequestContext,
    Transaction,
} from '@firelancer/core';
import { Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('hello-world')
export class HelloWorldController {
    constructor(
        private readonly assetService: AssetService,
        private readonly collectionService: CollectionService,
        private readonly balanceService: BalanceService,
        private readonly customerService: CustomerService,
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
        if (!collection) {
            throw new EntityNotFoundError('Collection', id);
        }
        return this.collectionService.getCollectionCollectableIds(collection, JobPost, ctx);
    }

    @Transaction()
    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    uploadFile(@Ctx() ctx: RequestContext, @UploadedFile() file: Express.Multer.File) {
        file.filename = file.originalname;
        return this.assetService.create(ctx, { file });
    }

    @Get('/balance')
    @Allow(Permission.Public)
    async getBalance(@Ctx() ctx: RequestContext) {
        const customer = await this.customerService.getUserCustomerFromRequest(ctx);
        return this.balanceService.findAll(ctx, {
            filter: {
                customerId: { eq: String(customer.id) },
            },
            skip: 0,
            take: 2,
            sort: { createdAt: 'ASC' },
        });
    }

    @Transaction()
    @Post('/balance')
    @Allow(Permission.Public)
    async balance(@Ctx() ctx: RequestContext) {
        try {
            const customer = await this.customerService.getUserCustomerFromRequest(ctx);
            return await this.balanceService.create(ctx, {
                type: BalanceEntryType.PAYMENT,
                currencyCode: CurrencyCode.USD,
                credit: 100_00,
                debit: 0,
                customer,
                description: 'test payment 2',
                reviewDays: 0,
            });
        } catch (error) {
            console.log(error);
            throw error;
        }
    }
}
