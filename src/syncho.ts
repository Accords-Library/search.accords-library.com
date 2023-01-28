import { MeiliDocumentsType, MeiliIndices } from "core/graphql/meiliTypes";
import { getReadySdk } from "core/graphql/sdk";
import { getMeili, strapiToMeiliTransformFunctions } from "helpers/meili";

export const synchronizeStrapiAndMeili = async () => {
  const sdk = getReadySdk();

  // [ LIBRARY ITEMS ]
  {
    const libraryItems = await sdk.getLibraryItems();
    processIndex(
      MeiliIndices.LIBRARY_ITEM,
      libraryItems.libraryItems?.data.map((item) =>
        strapiToMeiliTransformFunctions["library-item"](item)
      ),
      ["title", "subtitle", "descriptions"],
      ["sortable_name", "sortable_date", "sortable_price"],
      ["primary", "root_item", "id", "untangible_group_item"]
    );
  }

  // [ CONTENT ]
  {
    const content = await sdk.getContents();
    processIndex(
      MeiliIndices.CONTENT,
      content.contents?.data.map((item) => strapiToMeiliTransformFunctions["content"](item)),
      ["translations"],
      ["slug", "sortable_updated_date"]
    );
  }

  // [ VIDEOS ]
  {
    const videos = await sdk.getVideos();
    processIndex(
      MeiliIndices.VIDEOS,
      videos.videos?.data.map((item) => strapiToMeiliTransformFunctions["video"](item)),
      ["title", "channel", "description", "uid"],
      ["sortable_published_date", "duration", "views"],
      ["gone", "channel_uid"]
    );
  }

  // [ POSTS ]
  {
    const posts = await sdk.getPosts();
    processIndex(
      MeiliIndices.POST,
      posts.posts?.data.map((item) => strapiToMeiliTransformFunctions["post"](item)),
      ["translations"],
      ["sortable_date"],
      ["hidden"]
    );
  }

  // [ WIKI PAGES ]
  {
    const wikiPages = await sdk.getWikiPages();
    processIndex(
      MeiliIndices.WIKI_PAGE,
      wikiPages.wikiPages?.data.map((item) => strapiToMeiliTransformFunctions["wiki-page"](item)),
      ["translations", "definitions"]
    );
  }
};

const processIndex = async <I extends MeiliDocumentsType["index"]>(
  indexName: I,
  data?: Extract<MeiliDocumentsType, { index: I }>["documents"][],
  searchableAttributes?: (keyof NonNullable<typeof data>[number])[],
  sortableAttributes?: (keyof NonNullable<typeof data>[number])[],
  filterableAttributes?: (keyof NonNullable<typeof data>[number])[]
) => {
  const meili = getMeili();
  await meili.deleteIndexIfExists(indexName);

  if (data && data.length > 0) {
    await meili.createIndex(indexName);
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
