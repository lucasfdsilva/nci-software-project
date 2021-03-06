const AWS = require('aws-sdk');

module.exports = {
  async uploadPictures(postId, files){
    try {
      console.log('uploading pictures...')
      console.log(files)

      const urls = []

      if(Array.isArray(files)){
        for(let i = 0; i < files.length; i++){

          const s3 = new AWS.S3.ManagedUpload({
            params: {
              Bucket: 'myhairdone-portfolioimages',
              Key: `post${postId}_${files[i].name}`,
              Body: files[i].data,
              ContentType: "image/jpeg"
            }
          });
          
          const promise = await s3.promise()
            .then(
            function(data) {
              console.log(`Successfully uploaded image...Images to be uploaded: ${files.length - i} `);
              urls.push(data.Location)
            },
            function(err) {
              console.log("Error uploading image to S3. ", err.message);
              return err.message
            }
          );
        }

        return urls;

      } else {
        const s3 = new AWS.S3.ManagedUpload({
          params: {
            Bucket: 'myhairdone-portfolioimages',
            Key: `post${postId}_${files.name}`,
            Body: files.data,
            ContentType: "image/jpeg"
          }
        });

        var url = ""
        
        const promise = await s3.promise()
          .then(
          function(data) {
            console.log(`Successfully uploaded image.`); 
            url = data.Location
          },
          function(err) {
            console.log("Error uploading image to S3. ", err.message);
            return err.message
          })

          return url;
      }

    } catch (error) {
        console.log(error)
    }
  }
}