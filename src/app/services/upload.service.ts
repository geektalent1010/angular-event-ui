import { Injectable } from '@angular/core';
import * as AWS from 'aws-sdk/global';
import * as S3 from 'aws-sdk/clients/s3';
import { v4 as uuid } from 'uuid';
import { BehaviorSubject, bindCallback, Observable, of, bindNodeCallback } from 'rxjs';
import { map } from 'rxjs/operators';

const bucket = new S3({
  accessKeyId: 'AKIATOJJ7F45QH3V7EHR',
  secretAccessKey: '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',
  region: 'us-east-2',
});
@Injectable({
  providedIn: 'root',
})
export class UploadService {
  private imageData = new BehaviorSubject(1);
  public imageData$ = this.imageData.asObservable();
  constructor() {}

  getFile(folder, fileName) {
    if(!fileName){
      return of('');
    }
    const params = {
      Bucket: 'csi-event-images',
      Key: folder+'/'+fileName,
    };
    const getObjectAsObservable = bindNodeCallback(
      bucket.getObject.bind(bucket)
    );
    return getObjectAsObservable(params).pipe(
      map((x: any) => 'data:image/png;base64,'+this.Uint8ToBase64(x?.Body))
    );
  }

  Uint8ToBase64(u8Arr){
    var CHUNK_SIZE = 0x8000; //arbitrary number
    var index = 0;
    var length = u8Arr.length;
    var result = '';
    var slice;
    while (index < length) {
      slice = u8Arr.subarray(index, Math.min(index + CHUNK_SIZE, length)); 
      result += String.fromCharCode.apply(null, slice);
      index += CHUNK_SIZE;
    }
    return btoa(result);
  }

  uploadFile(folder, file) {
    const contentType = file.type;
    const fileName = uuid() + '_' + file.name.replaceAll(' ', '_');
    const params = {
      Bucket: 'csi-event-images',
      Key: folder +'/'+ fileName,
      Body: file,
      ACL: 'public-read',
      ContentType: contentType,
    };
    bucket.upload(params, function (err, data) {
      if (err) {
        console.log('There was an error uploading your file: ', err);
        return false;
      }
      console.log('Successfully uploaded file.', data);
      return true;
    });

    return fileName;
    //for upload progress
    /*bucket.upload(params).on('httpUploadProgress', function (evt) {
          console.log(evt.loaded + ' of ' + evt.total + ' Bytes');
      }).send(function (err, data) {
          if (err) {
              console.log('There was an error uploading your file: ', err);
              return false;
          }
          console.log('Successfully uploaded file.', data);
          return true;
      });*/
  }
}
