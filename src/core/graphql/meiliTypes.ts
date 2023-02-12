import {
  ContentAttributesFragment,
  GetContentQuery,
  GetLibraryItemQuery,
  GetPostQuery,
  GetVideoQuery,
  GetWeaponQuery,
  GetWikiPageQuery,
  LibraryItemAttributesFragment,
  PostAttributesFragment,
  VideoAttributesFragment,
  WeaponAttributesFragment,
  WikiPageAttributesFragment,
} from "./generated";

export interface MeiliLibraryItem extends LibraryItemAttributesFragment {
  id: string;
  sortable_name: string;
  sortable_price: number | undefined;
  sortable_date: number | undefined;
  untangible_group_item: boolean;
}

export interface MeiliContent
  extends Omit<ContentAttributesFragment, "translations" | "updatedAt"> {
  id: string;
  translations: (Omit<
    NonNullable<NonNullable<ContentAttributesFragment["translations"]>[number]>,
    "description" | "text_set"
  > & {
    displayable_description?: string | null;
  })[];
  sortable_updated_date: number;
}

export interface MeiliVideo extends VideoAttributesFragment {
  id: string;
  sortable_published_date: number;
  channel_uid?: string;
}

export interface MeiliPost extends PostAttributesFragment {
  id: string;
  sortable_date: number;
}

export interface MeiliWikiPage extends Omit<WikiPageAttributesFragment, "translations"> {
  id: string;
  translations: (Omit<
    NonNullable<NonNullable<WikiPageAttributesFragment["translations"]>[number]>,
    "body"
  > & {
    displayable_description?: string | null;
  })[];
}

type WeaponAttributesTranslation = NonNullable<
  NonNullable<
    NonNullable<NonNullable<WeaponAttributesFragment["stories"]>[number]>["translations"]
  >[number]
>;

export interface MeiliWeapon extends Omit<WeaponAttributesFragment, "name" | "stories"> {
  id: string;
  categories: NonNullable<
    NonNullable<NonNullable<WeaponAttributesFragment["stories"]>[number]>["categories"]
  >["data"];
  translations: {
    id: NonNullable<NonNullable<WeaponAttributesFragment["stories"]>[number]>["id"];
    names: string[];
    description: string;
    language: WeaponAttributesTranslation["language"];
  }[];
}

export enum MeiliIndices {
  LIBRARY_ITEM = "library-item",
  CONTENT = "content",
  VIDEOS = "video",
  POST = "post",
  WIKI_PAGE = "wiki-page",
  WEAPON = "weapon",
}

export type MeiliDocumentsType =
  | {
      index: MeiliIndices.CONTENT;
      documents: MeiliContent;
      strapi: GetContentQuery["content"];
    }
  | {
      index: MeiliIndices.LIBRARY_ITEM;
      documents: MeiliLibraryItem;
      strapi: GetLibraryItemQuery["libraryItem"];
    }
  | {
      index: MeiliIndices.POST;
      documents: MeiliPost;
      strapi: GetPostQuery["post"];
    }
  | {
      index: MeiliIndices.VIDEOS;
      documents: MeiliVideo;
      strapi: GetVideoQuery["video"];
    }
  | {
      index: MeiliIndices.WEAPON;
      documents: MeiliWeapon;
      strapi: GetWeaponQuery["weaponStory"];
    }
  | {
      index: MeiliIndices.WIKI_PAGE;
      documents: MeiliWikiPage;
      strapi: GetWikiPageQuery["wikiPage"];
    };
