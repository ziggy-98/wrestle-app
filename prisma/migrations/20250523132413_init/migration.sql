-- CreateTable
CREATE TABLE "Wrestler" (
    "id" BIGSERIAL NOT NULL,
    "birthplace" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "height" TEXT NOT NULL,
    "weight" TEXT NOT NULL,
    "debut" TEXT NOT NULL,
    "retired" TEXT NOT NULL,
    "nicknames" JSONB NOT NULL,
    "signatureMoves" JSONB NOT NULL,

    CONSTRAINT "Wrestler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" BIGSERIAL NOT NULL,
    "event_id" BIGINT NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match_Wrestlers" (
    "match_id" BIGINT NOT NULL,
    "wrestler_id" BIGINT NOT NULL,

    CONSTRAINT "Match_Wrestlers_pkey" PRIMARY KEY ("match_id","wrestler_id")
);

-- CreateTable
CREATE TABLE "Title" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "promotion_id" BIGINT NOT NULL,

    CONSTRAINT "Title_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wrestler_Titles" (
    "wrestler_id" BIGINT NOT NULL,
    "title_id" BIGINT NOT NULL,

    CONSTRAINT "Wrestler_Titles_pkey" PRIMARY KEY ("wrestler_id","title_id")
);

-- CreateTable
CREATE TABLE "Promotion" (
    "id" BIGSERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Promotion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promotion_Wrestlers" (
    "promotion_id" BIGINT NOT NULL,
    "wrestler_id" BIGINT NOT NULL,

    CONSTRAINT "Promotion_Wrestlers_pkey" PRIMARY KEY ("wrestler_id","promotion_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Title_name_key" ON "Title"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Promotion_name_key" ON "Promotion"("name");

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match_Wrestlers" ADD CONSTRAINT "Match_Wrestlers_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Match"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match_Wrestlers" ADD CONSTRAINT "Match_Wrestlers_wrestler_id_fkey" FOREIGN KEY ("wrestler_id") REFERENCES "Wrestler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Title" ADD CONSTRAINT "Title_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wrestler_Titles" ADD CONSTRAINT "Wrestler_Titles_wrestler_id_fkey" FOREIGN KEY ("wrestler_id") REFERENCES "Wrestler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wrestler_Titles" ADD CONSTRAINT "Wrestler_Titles_title_id_fkey" FOREIGN KEY ("title_id") REFERENCES "Title"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion_Wrestlers" ADD CONSTRAINT "Promotion_Wrestlers_promotion_id_fkey" FOREIGN KEY ("promotion_id") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promotion_Wrestlers" ADD CONSTRAINT "Promotion_Wrestlers_wrestler_id_fkey" FOREIGN KEY ("wrestler_id") REFERENCES "Wrestler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
