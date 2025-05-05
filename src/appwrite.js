import { Databases, Query, Client,ID } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID;


const client = new Client()
    .setEndpoint('https://cloud.appwrite.io/v1')
    .setProject(PROJECT_ID)

const database = new Databases(client);

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        const results = await database.listDocuments(DATABASE_ID, COLLECTION_ID, { queries: [Query.equal('searchTerm', searchTerm)],
        });

         if (results.documents.length > 0) {
            const doc = results.documents[0];
        
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id,{
                count: doc.count + 1,
            });

        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm, 
                count: 1, 
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500/${movie.poster_path}`,

            })
        }
    } catch(error) {
        console.error(error);
    }

}
export const getTrendingMovies = async () => {
    try {
      const results = await database.listDocuments(DATABASE_ID, COLLECTION_ID, {
        queries: [
          Query.orderDesc("count"),
          Query.limit(5),
        ],
      });
  
      return results.documents;
    } catch (error) {
      console.error("Failed to get trending movies:", error);
      return [];
    }
  };
  
// export const getTrendingMovies = async () =>{
//     const results = await.database.listDocuments(DATABASE_ID, COLLECTION_ID, { queries: [Query.equal('searchTerm', searchTerm)],
//         Query.limit(limit:5), 
//         Query.orderDesc(attribute: "count"),
//     });

//     return results.documents;
// } catch(error){
//     console.error(error);
//     return [];
// }

