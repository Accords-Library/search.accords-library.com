import { MeiliDocumentsType, MeiliIndices } from "core/graphql/meiliTypes";
import { getReadySdk } from "core/graphql/sdk";
import { getMeili, strapiToMeiliTransformFunctions } from "helpers/meili";

export const synchronizeStrapiAndMeili = async (): Promise<void> => {
  const sdk = getReadySdk();
  const meili = getMeili();
  const indexes = await meili.getIndexes();
  await Promise.all(indexes.results.map(async (index) => index.delete()));

  // [ LIBRARY ITEMS ]

  const libraryItems = await sdk.getLibraryItems();
  processIndex(
    MeiliIndices.LIBRARY_ITEM,
    libraryItems.libraryItems?.data.map((item) =>
      strapiToMeiliTransformFunctions.libraryItem(item)
    ),
    ["title", "subtitle", "descriptions"],
    ["sortable_name", "sortable_date", "sortable_price"],
    ["primary", "root_item", "id", "untangible_group_item", "filterable_categories"]
  );

  // [ CONTENT ]

  const content = await sdk.getContents();
  processIndex(
    MeiliIndices.CONTENT,
    content.contents?.data.map((item) => strapiToMeiliTransformFunctions.content(item)),
    [
      "translations.title",
      "translations.pre_title",
      "translations.subtitle",
      "translations.displayable_description",
    ],
    ["slug", "sortable_updated_date"]
  );

  // [ VIDEOS ]

  const videos = await sdk.getVideos();
  processIndex(
    MeiliIndices.VIDEOS,
    videos.videos?.data.map((item) => strapiToMeiliTransformFunctions.video(item)),
    ["title", "channel", "description", "uid"],
    ["sortable_published_date", "duration", "views"],
    ["gone", "channel_uid"]
  );

  // [ POSTS ]

  const posts = await sdk.getPosts();
  processIndex(
    MeiliIndices.POST,
    posts.posts?.data.map((item) => strapiToMeiliTransformFunctions.post(item)),
    ["translations.title", "translations.excerpt", "translations.body"],
    ["sortable_date"],
    ["hidden"]
  );

  // [ WIKI PAGES ]

  const wikiPages = await sdk.getWikiPages();
  processIndex(
    MeiliIndices.WIKI_PAGE,
    wikiPages.wikiPages?.data.map((item) => strapiToMeiliTransformFunctions.wikiPage(item)),
    [
      "translations.title",
      "translations.summary",
      "translations.displayable_description",
      "definitions",
    ]
  );

  // [ WEAPONS ]

  const weapons = await sdk.getWeapons();
  processIndex(
    MeiliIndices.WEAPON,
    weapons.weaponStories?.data.map((item) => strapiToMeiliTransformFunctions.weapon(item)),
    ["translations.names", "translations.description"],
    ["slug"]
  );
};

const processIndex = async <I extends MeiliDocumentsType["index"]>(
  indexName: I,
  data?: Extract<MeiliDocumentsType, { index: I }>["documents"][],
  searchableAttributes?: string[],
  sortableAttributes?: (keyof NonNullable<typeof data>[number])[],
  filterableAttributes?: (keyof NonNullable<typeof data>[number])[]
) => {
  const meili = getMeili();

  if (data && data.length > 0) {
    await meili.createIndex(indexName, { primaryKey: "id" });
    const index = meili.index(indexName);
    index.updateSettings({
      searchableAttributes: searchableAttributes as string[],
      sortableAttributes: sortableAttributes as string[],
      filterableAttributes: filterableAttributes as string[],
      pagination: { maxTotalHits: 10000 },
    });
    index.addDocuments(data);
  }
};
