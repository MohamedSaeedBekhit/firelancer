import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitalMigration1735861401623 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(
            `CREATE TABLE "authentication_method" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "identifier" character varying, "passwordHash" character varying, "verificationToken" character varying, "passwordResetToken" character varying, "identifierChangeToken" character varying, "pendingIdentifier" character varying, "strategy" character varying, "externalIdentifier" character varying, "metadata" text, "id" SERIAL NOT NULL, "type" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_e204686018c3c60f6164e385081" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(`CREATE INDEX "IDX_00cbe87bc0d4e36758d61bd31d" ON "authentication_method" ("userId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_a23445b2c942d8dfcae15b8de2" ON "authentication_method" ("type") `, undefined);
        await queryRunner.query(
            `CREATE TABLE "session" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "token" character varying NOT NULL, "expires" TIMESTAMP NOT NULL, "invalidated" boolean NOT NULL, "authenticationStrategy" character varying, "id" SERIAL NOT NULL, "type" character varying NOT NULL, "userId" integer, CONSTRAINT "PK_f55da76ac1c3ac420f444d2ff11" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_232f8e85d7633bd6ddfad42169" ON "session" ("token") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_3d2f174ef04fb312fdebd0ddc5" ON "session" ("userId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_e5598363000cab9d9116bd5835" ON "session" ("type") `, undefined);
        await queryRunner.query(
            `CREATE TABLE "role" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "code" character varying NOT NULL, "description" character varying NOT NULL, "permissions" text NOT NULL, "id" SERIAL NOT NULL, CONSTRAINT "PK_b36bcfe02fc8de3c57a8b2391c2" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(
            `CREATE TABLE "user" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "identifier" character varying NOT NULL, "verified" boolean NOT NULL DEFAULT false, "lastLogin" TIMESTAMP, "id" SERIAL NOT NULL, CONSTRAINT "UQ_7efb296eadd258e554e84fa6eb6" UNIQUE ("identifier"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(
            `CREATE TABLE "administrator" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "emailAddress" character varying NOT NULL, "id" SERIAL NOT NULL, "userId" integer, CONSTRAINT "UQ_154f5c538b1576ccc277b1ed631" UNIQUE ("emailAddress"), CONSTRAINT "REL_1966e18ce6a39a82b19204704d" UNIQUE ("userId"), CONSTRAINT "PK_ee58e71b3b4008b20ddc7b3092b" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(
            `CREATE TABLE "customer" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "title" character varying, "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "phoneNumber" character varying, "emailAddress" character varying NOT NULL, "id" SERIAL NOT NULL, "userId" integer, CONSTRAINT "REL_3f62b42ed23958b120c235f74d" UNIQUE ("userId"), CONSTRAINT "PK_a7a13f4cacb744524e44dfdad32" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(
            `CREATE TABLE "facet" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "code" character varying NOT NULL, "name" character varying NOT NULL, "id" SERIAL NOT NULL, CONSTRAINT "UQ_0c9a5d053fdf4ebb5f0490b40fd" UNIQUE ("code"), CONSTRAINT "PK_a0ebfe3c68076820c6886aa9ff3" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(
            `CREATE TABLE "facet_value" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "code" character varying NOT NULL, "name" character varying NOT NULL, "id" SERIAL NOT NULL, "facetId" integer NOT NULL, CONSTRAINT "PK_d231e8eecc7e1a6059e1da7d325" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(`CREATE INDEX "IDX_d101dc2265a7341be3d94968c5" ON "facet_value" ("facetId") `, undefined);
        await queryRunner.query(
            `CREATE TABLE "job_post_asset" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "position" integer NOT NULL, "id" SERIAL NOT NULL, "jobPostId" integer NOT NULL, "assetId" integer NOT NULL, CONSTRAINT "PK_880dd97c36cc75453f592482626" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(`CREATE INDEX "IDX_ee44237b8964f6c9223377be7f" ON "job_post_asset" ("assetId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_c1ed28c618dd757b037bd1624b" ON "job_post_asset" ("jobPostId") `, undefined);
        await queryRunner.query(
            `CREATE TABLE "job_post" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "publishedAt" TIMESTAMP, "customerId" integer NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "enabled" boolean NOT NULL, "private" boolean NOT NULL, "id" SERIAL NOT NULL, CONSTRAINT "PK_a70f902a85e6de57340d153c813" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(
            `CREATE TABLE "collection_asset" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "position" integer NOT NULL, "collectionId" integer NOT NULL, "id" SERIAL NOT NULL, "assetId" integer NOT NULL, CONSTRAINT "PK_a2adab6fd086adfb7858f1f110c" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(`CREATE INDEX "IDX_51da53b26522dc0525762d2de8" ON "collection_asset" ("assetId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_1ed9e48dfbf74b5fcbb35d3d68" ON "collection_asset" ("collectionId") `, undefined);
        await queryRunner.query(
            `CREATE TABLE "collection" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "isRoot" boolean NOT NULL DEFAULT false, "position" integer NOT NULL, "isPrivate" boolean NOT NULL DEFAULT false, "name" character varying NOT NULL, "description" character varying NOT NULL, "slug" character varying NOT NULL, "filters" text NOT NULL, "inheritFilters" boolean NOT NULL DEFAULT true, "id" SERIAL NOT NULL, "parentId" integer, "featuredAssetId" integer, CONSTRAINT "PK_ad3f485bbc99d875491f44d7c85" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(`CREATE INDEX "IDX_7256fef1bb42f1b38156b7449f" ON "collection" ("featuredAssetId") `, undefined);
        await queryRunner.query(
            `CREATE TABLE "asset" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "type" character varying NOT NULL, "mimeType" character varying NOT NULL, "width" integer NOT NULL DEFAULT '0', "height" integer NOT NULL DEFAULT '0', "fileSize" integer NOT NULL, "source" character varying NOT NULL, "preview" character varying NOT NULL, "focalPoint" text, "id" SERIAL NOT NULL, CONSTRAINT "PK_1209d107fe21482beaea51b745e" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(
            `CREATE TABLE "balance_entry" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying NOT NULL, "description" character varying, "currencyCode" character varying NOT NULL, "reviewDays" integer NOT NULL DEFAULT '0', "settledAt" TIMESTAMP, "rejectedAt" TIMESTAMP, "prevSettledAt" TIMESTAMP, "metadata" text, "id" SERIAL NOT NULL, "customerId" integer NOT NULL, "parentId" integer, "balance" integer, "credit" integer NOT NULL DEFAULT '0', "debit" integer NOT NULL DEFAULT '0', "prevBalance" integer, CONSTRAINT "CHK_1d327a108f69d3eda73b5b50ca" CHECK (("prevSettledAt" IS NULL AND "prevBalance" IS NULL) OR ("prevSettledAt" IS NOT NULL AND "prevBalance" IS NOT NULL)), CONSTRAINT "CHK_88b99ce1e581e28ffe2307cf87" CHECK ("prevSettledAt" < "settledAt"), CONSTRAINT "CHK_c06d05c9479eccdd0c1d448f8b" CHECK ("balance" = COALESCE("prevBalance", 0) + "credit" - "debit"), CONSTRAINT "PK_8fb391d29b558b0320c5a0e3036" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(
            `CREATE TABLE "history_entry" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "type" character varying NOT NULL, "isPublic" boolean NOT NULL, "data" text NOT NULL, "id" SERIAL NOT NULL, "discriminator" character varying NOT NULL, "administratorId" integer, "customerId" integer, CONSTRAINT "PK_b65bd95b0d2929668589d57b97a" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(`CREATE INDEX "IDX_92f8c334ef06275f9586fd0183" ON "history_entry" ("administratorId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_43ac602f839847fdb91101f30e" ON "history_entry" ("customerId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_f3a761f6bcfabb474b11e1e51f" ON "history_entry" ("discriminator") `, undefined);
        await queryRunner.query(
            `CREATE TABLE "job_record_buffer" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "bufferId" character varying NOT NULL, "job" text NOT NULL, "id" SERIAL NOT NULL, CONSTRAINT "PK_9a1cfa02511065b32053efceeff" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(
            `CREATE TABLE "job_record" ("createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "queueName" character varying NOT NULL, "data" text, "state" character varying NOT NULL, "progress" integer NOT NULL, "result" text, "error" character varying, "startedAt" TIMESTAMP(6), "settledAt" TIMESTAMP(6), "isSettled" boolean NOT NULL, "retries" integer NOT NULL, "attempts" integer NOT NULL, "id" SERIAL NOT NULL, CONSTRAINT "PK_88ce3ea0c9dca8b571450b457a7" PRIMARY KEY ("id"))`,
            undefined,
        );
        await queryRunner.query(
            `CREATE TABLE "user_roles_role" ("userId" integer NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_b47cd6c84ee205ac5a713718292" PRIMARY KEY ("userId", "roleId"))`,
            undefined,
        );
        await queryRunner.query(`CREATE INDEX "IDX_5f9286e6c25594c6b88c108db7" ON "user_roles_role" ("userId") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_4be2f7adf862634f5f803d246b" ON "user_roles_role" ("roleId") `, undefined);
        await queryRunner.query(
            `CREATE TABLE "job_post_facet_values_facet_value" ("jobPostId" integer NOT NULL, "facetValueId" integer NOT NULL, CONSTRAINT "PK_4627c9d7b1a190feece9c87c085" PRIMARY KEY ("jobPostId", "facetValueId"))`,
            undefined,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_3d8dfbc3432b77cb48103ee032" ON "job_post_facet_values_facet_value" ("jobPostId") `,
            undefined,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_d5a6128c439c09b691c48a25eb" ON "job_post_facet_values_facet_value" ("facetValueId") `,
            undefined,
        );
        await queryRunner.query(
            `CREATE TABLE "collection_job_posts_job_post" ("collectionId" integer NOT NULL, "jobPostId" integer NOT NULL, CONSTRAINT "PK_445e771271c1d8f38a9b2a1cb63" PRIMARY KEY ("collectionId", "jobPostId"))`,
            undefined,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_08139e575080cd25187fd6fa02" ON "collection_job_posts_job_post" ("collectionId") `,
            undefined,
        );
        await queryRunner.query(
            `CREATE INDEX "IDX_9f21d87b5af12d4dfce9ad5917" ON "collection_job_posts_job_post" ("jobPostId") `,
            undefined,
        );
        await queryRunner.query(
            `CREATE TABLE "collection_closure" ("id_ancestor" integer NOT NULL, "id_descendant" integer NOT NULL, CONSTRAINT "PK_9dda38e2273a7744b8f655782a5" PRIMARY KEY ("id_ancestor", "id_descendant"))`,
            undefined,
        );
        await queryRunner.query(`CREATE INDEX "IDX_c309f8cd152bbeaea08491e0c6" ON "collection_closure" ("id_ancestor") `, undefined);
        await queryRunner.query(`CREATE INDEX "IDX_457784c710f8ac9396010441f6" ON "collection_closure" ("id_descendant") `, undefined);
        await queryRunner.query(
            `ALTER TABLE "authentication_method" ADD CONSTRAINT "FK_00cbe87bc0d4e36758d61bd31d6" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "session" ADD CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "administrator" ADD CONSTRAINT "FK_1966e18ce6a39a82b19204704d7" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "customer" ADD CONSTRAINT "FK_3f62b42ed23958b120c235f74df" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "facet_value" ADD CONSTRAINT "FK_d101dc2265a7341be3d94968c5b" FOREIGN KEY ("facetId") REFERENCES "facet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "job_post_asset" ADD CONSTRAINT "FK_ee44237b8964f6c9223377be7f8" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "job_post_asset" ADD CONSTRAINT "FK_c1ed28c618dd757b037bd1624bf" FOREIGN KEY ("jobPostId") REFERENCES "job_post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "job_post" ADD CONSTRAINT "FK_eefeb315e1ee3ef2f252f1d3671" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "collection_asset" ADD CONSTRAINT "FK_51da53b26522dc0525762d2de8e" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "collection_asset" ADD CONSTRAINT "FK_1ed9e48dfbf74b5fcbb35d3d686" FOREIGN KEY ("collectionId") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "collection" ADD CONSTRAINT "FK_4257b61275144db89fa0f5dc059" FOREIGN KEY ("parentId") REFERENCES "collection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "collection" ADD CONSTRAINT "FK_7256fef1bb42f1b38156b7449f5" FOREIGN KEY ("featuredAssetId") REFERENCES "asset"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "balance_entry" ADD CONSTRAINT "FK_8617695e2ce579c6194fe685f7a" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "balance_entry" ADD CONSTRAINT "FK_17fc1ea7fcb1da3d217302b19d3" FOREIGN KEY ("parentId") REFERENCES "balance_entry"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "history_entry" ADD CONSTRAINT "FK_92f8c334ef06275f9586fd01832" FOREIGN KEY ("administratorId") REFERENCES "administrator"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "history_entry" ADD CONSTRAINT "FK_43ac602f839847fdb91101f30ec" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_5f9286e6c25594c6b88c108db77" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "user_roles_role" ADD CONSTRAINT "FK_4be2f7adf862634f5f803d246b8" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "job_post_facet_values_facet_value" ADD CONSTRAINT "FK_3d8dfbc3432b77cb48103ee032f" FOREIGN KEY ("jobPostId") REFERENCES "job_post"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "job_post_facet_values_facet_value" ADD CONSTRAINT "FK_d5a6128c439c09b691c48a25ebd" FOREIGN KEY ("facetValueId") REFERENCES "facet_value"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "collection_job_posts_job_post" ADD CONSTRAINT "FK_08139e575080cd25187fd6fa028" FOREIGN KEY ("collectionId") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "collection_job_posts_job_post" ADD CONSTRAINT "FK_9f21d87b5af12d4dfce9ad59173" FOREIGN KEY ("jobPostId") REFERENCES "job_post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "collection_closure" ADD CONSTRAINT "FK_c309f8cd152bbeaea08491e0c66" FOREIGN KEY ("id_ancestor") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "collection_closure" ADD CONSTRAINT "FK_457784c710f8ac9396010441f6c" FOREIGN KEY ("id_descendant") REFERENCES "collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
            undefined,
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query(`ALTER TABLE "collection_closure" DROP CONSTRAINT "FK_457784c710f8ac9396010441f6c"`, undefined);
        await queryRunner.query(`ALTER TABLE "collection_closure" DROP CONSTRAINT "FK_c309f8cd152bbeaea08491e0c66"`, undefined);
        await queryRunner.query(`ALTER TABLE "collection_job_posts_job_post" DROP CONSTRAINT "FK_9f21d87b5af12d4dfce9ad59173"`, undefined);
        await queryRunner.query(`ALTER TABLE "collection_job_posts_job_post" DROP CONSTRAINT "FK_08139e575080cd25187fd6fa028"`, undefined);
        await queryRunner.query(
            `ALTER TABLE "job_post_facet_values_facet_value" DROP CONSTRAINT "FK_d5a6128c439c09b691c48a25ebd"`,
            undefined,
        );
        await queryRunner.query(
            `ALTER TABLE "job_post_facet_values_facet_value" DROP CONSTRAINT "FK_3d8dfbc3432b77cb48103ee032f"`,
            undefined,
        );
        await queryRunner.query(`ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_4be2f7adf862634f5f803d246b8"`, undefined);
        await queryRunner.query(`ALTER TABLE "user_roles_role" DROP CONSTRAINT "FK_5f9286e6c25594c6b88c108db77"`, undefined);
        await queryRunner.query(`ALTER TABLE "history_entry" DROP CONSTRAINT "FK_43ac602f839847fdb91101f30ec"`, undefined);
        await queryRunner.query(`ALTER TABLE "history_entry" DROP CONSTRAINT "FK_92f8c334ef06275f9586fd01832"`, undefined);
        await queryRunner.query(`ALTER TABLE "balance_entry" DROP CONSTRAINT "FK_17fc1ea7fcb1da3d217302b19d3"`, undefined);
        await queryRunner.query(`ALTER TABLE "balance_entry" DROP CONSTRAINT "FK_8617695e2ce579c6194fe685f7a"`, undefined);
        await queryRunner.query(`ALTER TABLE "collection" DROP CONSTRAINT "FK_7256fef1bb42f1b38156b7449f5"`, undefined);
        await queryRunner.query(`ALTER TABLE "collection" DROP CONSTRAINT "FK_4257b61275144db89fa0f5dc059"`, undefined);
        await queryRunner.query(`ALTER TABLE "collection_asset" DROP CONSTRAINT "FK_1ed9e48dfbf74b5fcbb35d3d686"`, undefined);
        await queryRunner.query(`ALTER TABLE "collection_asset" DROP CONSTRAINT "FK_51da53b26522dc0525762d2de8e"`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post" DROP CONSTRAINT "FK_eefeb315e1ee3ef2f252f1d3671"`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post_asset" DROP CONSTRAINT "FK_c1ed28c618dd757b037bd1624bf"`, undefined);
        await queryRunner.query(`ALTER TABLE "job_post_asset" DROP CONSTRAINT "FK_ee44237b8964f6c9223377be7f8"`, undefined);
        await queryRunner.query(`ALTER TABLE "facet_value" DROP CONSTRAINT "FK_d101dc2265a7341be3d94968c5b"`, undefined);
        await queryRunner.query(`ALTER TABLE "customer" DROP CONSTRAINT "FK_3f62b42ed23958b120c235f74df"`, undefined);
        await queryRunner.query(`ALTER TABLE "administrator" DROP CONSTRAINT "FK_1966e18ce6a39a82b19204704d7"`, undefined);
        await queryRunner.query(`ALTER TABLE "session" DROP CONSTRAINT "FK_3d2f174ef04fb312fdebd0ddc53"`, undefined);
        await queryRunner.query(`ALTER TABLE "authentication_method" DROP CONSTRAINT "FK_00cbe87bc0d4e36758d61bd31d6"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_457784c710f8ac9396010441f6"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_c309f8cd152bbeaea08491e0c6"`, undefined);
        await queryRunner.query(`DROP TABLE "collection_closure"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_9f21d87b5af12d4dfce9ad5917"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_08139e575080cd25187fd6fa02"`, undefined);
        await queryRunner.query(`DROP TABLE "collection_job_posts_job_post"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_d5a6128c439c09b691c48a25eb"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d8dfbc3432b77cb48103ee032"`, undefined);
        await queryRunner.query(`DROP TABLE "job_post_facet_values_facet_value"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_4be2f7adf862634f5f803d246b"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_5f9286e6c25594c6b88c108db7"`, undefined);
        await queryRunner.query(`DROP TABLE "user_roles_role"`, undefined);
        await queryRunner.query(`DROP TABLE "job_record"`, undefined);
        await queryRunner.query(`DROP TABLE "job_record_buffer"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_f3a761f6bcfabb474b11e1e51f"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_43ac602f839847fdb91101f30e"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_92f8c334ef06275f9586fd0183"`, undefined);
        await queryRunner.query(`DROP TABLE "history_entry"`, undefined);
        await queryRunner.query(`DROP TABLE "balance_entry"`, undefined);
        await queryRunner.query(`DROP TABLE "asset"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_7256fef1bb42f1b38156b7449f"`, undefined);
        await queryRunner.query(`DROP TABLE "collection"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_1ed9e48dfbf74b5fcbb35d3d68"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_51da53b26522dc0525762d2de8"`, undefined);
        await queryRunner.query(`DROP TABLE "collection_asset"`, undefined);
        await queryRunner.query(`DROP TABLE "job_post"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_c1ed28c618dd757b037bd1624b"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_ee44237b8964f6c9223377be7f"`, undefined);
        await queryRunner.query(`DROP TABLE "job_post_asset"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_d101dc2265a7341be3d94968c5"`, undefined);
        await queryRunner.query(`DROP TABLE "facet_value"`, undefined);
        await queryRunner.query(`DROP TABLE "facet"`, undefined);
        await queryRunner.query(`DROP TABLE "customer"`, undefined);
        await queryRunner.query(`DROP TABLE "administrator"`, undefined);
        await queryRunner.query(`DROP TABLE "user"`, undefined);
        await queryRunner.query(`DROP TABLE "role"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_e5598363000cab9d9116bd5835"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_3d2f174ef04fb312fdebd0ddc5"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_232f8e85d7633bd6ddfad42169"`, undefined);
        await queryRunner.query(`DROP TABLE "session"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_a23445b2c942d8dfcae15b8de2"`, undefined);
        await queryRunner.query(`DROP INDEX "public"."IDX_00cbe87bc0d4e36758d61bd31d"`, undefined);
        await queryRunner.query(`DROP TABLE "authentication_method"`, undefined);
    }
}
