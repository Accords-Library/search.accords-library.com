import {
  MeiliContent,
  MeiliDocumentsType,
  MeiliIndices,
  MeiliWikiPage,
} from "core/graphql/meiliTypes";
import {
  filterDefined,
  filterHasAttributes,
  isDefined,
  isDefinedAndNotEmpty,
} from "core/helpers/asserts";
import { datePickerToDate, getUnixTime } from "core/helpers/date";
import { prettyInlineTitle } from "core/helpers/formatters";
import { isUntangibleGroupItem } from "core/helpers/libraryItem";
import { MeiliSearch } from "meilisearch";

export const getMeili = () =>
  new MeiliSearch({
    host: process.env.MEILISEARCH_URL ?? "",
    apiKey: process.env.MEILISEARCH_MASTER_KEY,
  });

type TransformFunction<I extends MeiliDocumentsType["index"]> = (
  data: NonNullable<Extract<MeiliDocumentsType, { index: I }>["strapi"]>["data"]
) => Extract<MeiliDocumentsType, { index: I }>["documents"];

const transformVideo: TransformFunction<MeiliIndices.VIDEOS> = (data) => {
  if (!data) throw new Error(`Data is empty ${MeiliIndices.VIDEOS}`);
  if (!data.attributes || !data.id)
    throw new Error(`Incorrect data stucture on ${MeiliIndices.VIDEOS}`);
  const { id, attributes } = data;
  return {
    id,
    ...attributes,
    sortable_published_date: getUnixTime(datePickerToDate(attributes.published_date)),
    channel_uid: attributes.channel?.data?.attributes?.uid,
  };
};

const transformContent: TransformFunction<MeiliIndices.CONTENT> = (data) => {
  if (!data) throw new Error(`Data is empty ${MeiliIndices.CONTENT}`);
  if (!data.attributes || !data.id)
    throw new Error(`Incorrect data stucture on ${MeiliIndices.CONTENT}`);
  const {
    id,
    attributes: { translations, updatedAt, ...otherAttributes },
  } = data;
  return {
    id,
    ...otherAttributes,
    translations: filterDefined(translations).map(
      ({ text_set, description, ...otherTranslatedFields }) => {
        let displayable_description = "";
        if (isDefinedAndNotEmpty(description)) displayable_description += description;
        if (isDefinedAndNotEmpty(text_set?.text))
          displayable_description += `\n\n${text_set?.text}`;
        return {
          ...otherTranslatedFields,
          displayable_description,
        };
      }
    ),
    sortable_updated_date: updatedAt,
  };
};

const transformLibraryItem: TransformFunction<MeiliIndices.LIBRARY_ITEM> = (data) => {
  if (!data) throw new Error(`Data is empty ${MeiliIndices.LIBRARY_ITEM}`);
  if (!data.attributes || !data.id)
    throw new Error(`Incorrect data stucture on ${MeiliIndices.LIBRARY_ITEM}`);
  const { id, attributes } = data;
  return {
    id,
    sortable_date: isDefined(attributes.release_date)
      ? getUnixTime(datePickerToDate(attributes.release_date))
      : undefined,
    sortable_name: prettyInlineTitle(undefined, attributes.title, attributes.subtitle),
    sortable_price:
      attributes.price?.currency?.data?.attributes && isDefined(attributes.price.amount)
        ? attributes.price.amount * attributes.price.currency.data.attributes.rate_to_usd
        : undefined,
    untangible_group_item: isUntangibleGroupItem(attributes.metadata?.[0]),
    ...attributes,
  };
};

const transformPost: TransformFunction<MeiliIndices.POST> = (data) => {
  if (!data) throw new Error(`Data is empty ${MeiliIndices.POST}`);
  if (!data.attributes || !data.id)
    throw new Error(`Incorrect data stucture on ${MeiliIndices.POST}`);
  const { id, attributes } = data;
  return {
    id,
    ...attributes,
    sortable_date: getUnixTime(datePickerToDate(attributes.date)),
  };
};

const transformWikiPage: TransformFunction<MeiliIndices.WIKI_PAGE> = (data) => {
  if (!data) throw new Error(`Data is empty ${MeiliIndices.POST}`);
  if (!data.attributes || !data.id)
    throw new Error(`Incorrect data stucture on ${MeiliIndices.POST}`);
  const {
    id,
    attributes: { translations, definitions, ...otherAttributes },
  } = data;
  return {
    id,
    definitions,
    translations: filterDefined(translations).map(({ summary, body, ...otherTransAttributes }) => {
      let displayable_description = "";
      if (isDefinedAndNotEmpty(summary)) displayable_description += summary;
      if (isDefined(body) && isDefinedAndNotEmpty(body.body))
        displayable_description += `\n\n${body.body}`;
      definitions?.forEach((def) =>
        def?.translations?.forEach((defTranslation) => {
          if (
            defTranslation?.language?.data?.attributes?.code ===
              otherTransAttributes.language?.data?.attributes?.code &&
            isDefined(defTranslation?.definition)
          ) {
            displayable_description += `\n\n${defTranslation?.definition}`;
          }
        })
      );
      return {
        summary,
        ...otherTransAttributes,
        displayable_description,
      };
    }),
    ...otherAttributes,
  };
};

export const strapiToMeiliTransformFunctions = {
  video: transformVideo,
  "library-item": transformLibraryItem,
  content: transformContent,
  post: transformPost,
  "wiki-page": transformWikiPage,
};
