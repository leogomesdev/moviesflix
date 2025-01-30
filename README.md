


{
  "fields": [
    {
      "numDimensions": 1536,
      "path": "embeddings",
      "similarity": "cosine",
      "type": "vector"
    }
  ]
}

17010 documents in the sample_mflix.movies collection, which would take more than 1h 50 min to create the embeddings sequencially one by one.

Instead, with parallel requests of 100 generations, the time to process 17010 documents is around 11 minutes.


original docs: 21349
deleted 4339 docs where

{ $or: [{ "runtime": { $exists: false } }, { "genres": { $exists: false } }, { "plot": { $exists: false } }, { "directors": { $exists: false } }, { "poster": { $exists: false } }, { "cast": { $exists: false } }, { "languages": { $exists: false } }] }


Final docs: 17010