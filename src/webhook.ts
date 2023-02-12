import { MeiliDocumentsType, MeiliIndices } from "core/graphql/meiliTypes";
import { getReadySdk } from "core/graphql/sdk";
import { getMeili, strapiToMeiliTransformFunctions } from "helpers/meili";
import http from "http";

const allowedEvents = ["entry.create", "entry.update", "entry.delete"] as const;

type CRUDEvents = typeof allowedEvents[number];

type StrapiEvent = {
  event: CRUDEvents;
  model: MeiliIndices;
  entry: {
    id: string;
  };
};

export const webhookHandler = async (
  data: StrapiEvent,
  res: http.ServerResponse
): Promise<void> => {
  console.log(data);

  if (!allowedEvents.includes(data.event)) {
    res.writeHead(406, { "Content-Type": "application/json" }).end(
      JSON.stringify({
        message: `The event given ${data.event} in not allowed.`,
      })
    );
    return;
  }

  const sdk = getReadySdk();

  switch (data.model) {
    case MeiliIndices.LIBRARY_ITEM: {
      processIndex(
        data.model,
        strapiToMeiliTransformFunctions.libraryItem(
          (await sdk.getLibraryItem({ id: data.entry.id })).libraryItem?.data
        )
      );
      break;
    }

    case MeiliIndices.CONTENT: {
      processIndex(
        data.model,
        strapiToMeiliTransformFunctions.content(
          (await sdk.getContent({ id: data.entry.id })).content?.data
        )
      );
      break;
    }

    case MeiliIndices.VIDEOS: {
      processIndex(
        data.model,
        strapiToMeiliTransformFunctions.video(
          (await sdk.getVideo({ id: data.entry.id })).video?.data
        )
      );
      break;
    }

    case MeiliIndices.POST: {
      processIndex(
        data.model,
        strapiToMeiliTransformFunctions.post((await sdk.getPost({ id: data.entry.id })).post?.data)
      );
      break;
    }

    case MeiliIndices.WIKI_PAGE: {
      processIndex(
        data.model,
        strapiToMeiliTransformFunctions.wikiPage(
          (await sdk.getWikiPage({ id: data.entry.id })).wikiPage?.data
        )
      );
      break;
    }

    case MeiliIndices.WEAPON: {
      processIndex(
        data.model,
        strapiToMeiliTransformFunctions.weapon(
          (await sdk.getWeapon({ id: data.entry.id })).weaponStory?.data
        )
      );
      break;
    }

    default: {
      console.log("Unrecognized data model", data.model);
      break;
    }
  }
};

const processIndex = async <I extends MeiliDocumentsType["index"]>(
  indexName: I,
  data: Extract<MeiliDocumentsType, { index: I }>["documents"] | null | undefined
) => {
  const meili = getMeili();
  const index = meili.index(indexName);
  await index.addDocuments([data]);
};
