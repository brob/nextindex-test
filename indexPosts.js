require('dotenv').config()
const algoliasearch = require('algoliasearch');

const client = algoliasearch(process.env.ALGOLIA_APP_ID, process.env.ALGOLIA_API_KEY);
const index = client.initIndex(process.env.ALGOLIA_INDEX_NAME);

function customBatch(posts) {
    const batch = [];

    posts.forEach(post => {
        batch.push({
            action: 'updateObject',
            indexName: 'blog',
            body: post
        });
    });
    return batch;
}

var fs = require('fs')
  , fm = require('front-matter')


async function updateIndex() {
    let posts = []

    fs.readdir('./_posts', (err, files) => {
        // reads each file in the posts directory
        if (err) throw err;
        files.forEach(file => {
            console.log(file)
            // reads each file in the posts directory
            fs.readFile('./_posts/' + file, 'utf8', (err, data) => {
                // parses the front matter of each file
                const parsed = fm(data)
                const normalizedPost = {
                    ...parsed.attributes,
                    objectID: file.split('.').slice(0, -1).join('.'),
                    "body": parsed.body
                }

                // adds the post to the array of posts
                posts.push(normalizedPost)


                // when all files have been read, index the posts
                if (posts.length == files.length) {
                    // indexPosts(posts)
                    console.log(posts)
                    const batchArray = customBatch(posts)
                    index.clearObjects().then(() => {
                        client.multipleBatch(batchArray).then((res,err) => {
                            console.log('success', res)
                        }).catch(err => {
                            console.log('error', err)
                        })
                    }).catch(err => {
                        console.log('error', err)
                    })
                    
                }
            })
        })
    })
    
}


updateIndex()