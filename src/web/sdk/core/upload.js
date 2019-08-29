import $ from 'jquery';
import '../common/lib/jquery.iframe.transport';
import '../common/lib/jquery.fileupload';
import '../common/lib/jquery.md5';
import {
  createUUID,
  bytesToMB,
  bytesToSize,
  checkUpLoadFileExist
} from '../common/utils/utils';

const limitFileSize = 1024 * 1024 * 50; // 50M;
const iframe = (() => {
  let ret = false;
  const browser = window.navigator.appName;
  const version = (window.navigator.appVersion || '').split(';');
  if (browser === 'Microsoft Internet Explorer'
    && version.length > 1
    && parseInt(version[1].replace(/[ ]/g, '').replace(/MSIE/g, ''), 10) < 10
  ) {
    ret = true;
  }
  return ret;
})();

// $inputImg.fileupload({
//   drop: function (e, data) {
//     $.each(data.files, function (index, file) {
//       alert('Dropped file: ' + file.name);
//     });
//   }
// });

function image(beforeFn, successFn, progressFn, filesList, onlyUrl) {
  const { myId, key } = this;
  const url = `/file/v2/upload/img?size=48&u=${myId}&k=${key}`;
  const $inputImg = $('<input type="file" name="file" accept="image/gif, image/jpeg,image/x-png" style="display:none;" multiple />');
  $(window.document.body).append($inputImg);
  $inputImg.fileupload({
    url,
    dataType: 'json',
    autoUpload: false,
    forceIframeTransport: iframe,
    limitMultiFileUploadSize: 1024 * 1024 * 50, // 50M
    add: (e, data) => {
      data.process().done(() => {
        $.each(data.files, (index, { size, name }) => {
          const uuid = $.md5(createUUID()); // $.md5(file.name);
          const sizeMB = bytesToMB(size);
          const paramLink = `name=${name}&size=${sizeMB}&u=${myId}&k=${key}&key=${uuid}&p=qim_web`;
          const newUrl = `/file/v2/upload/img?${paramLink}`;
          if (size > limitFileSize) {
            alert('图片大小不能超过50M');
            return;
          }
          // 设置新的提交地址
          data.setSubmitURL(newUrl);
          // 校验上传的图片是否存在
          // 如果图片存在了就不上传了，直接显示为和上传成功的效果
          const checkFileUrl =  `/file/v2/inspection/img?${paramLink}`;
          checkUpLoadFileExist(checkFileUrl)
            .done(async (res) => {
              beforeFn();
              if (res.ret) {
                data.submit();
              } else {
                let result = res.data; // 存在的图片URL地址
                if (iframe) {
                  result = $('pre', result).text();
                }
                const msg = `<img src="${result}" alt="" />`;
                if (onlyUrl) {
                  successFn(result);
                } else {
                  // 发送消息
                  const ret = await this.sendMessage(msg);
                  successFn(ret);
                }
                progressFn(100);
                $inputImg.remove();
              }
            });
        });
      });
    },
    done: async (e, data) => {
      let result = data.result.data;
      if (iframe) {
        result = $('pre', result).text();
      }
      const msg = `<img src="${result}" alt="" />`;
      if (onlyUrl) {
        successFn(result);
      } else {
        // 发送消息
        const ret = await this.sendMessage(msg);
        successFn(ret);
      }
      $inputImg.remove();
    },
    progress: (e, data) => {
      const progress = parseInt((data.loaded / data.total) * 100, 10);
      progressFn(progress);
    }
  });
  if (filesList && filesList.length > 0) {
    $inputImg.fileupload('add', { files: filesList });
  } else {
    $inputImg.trigger('click');
  }
}

function file(beforeFn, successFn, progressFn, filesList, onlyUrl) {
  const { myId, key } = this;
  const url = `/file/v2/upload/file?size=46&u=${myId}&k=${key}`;
  const $inputFile = $('<input type="file" name="file" style="display:none;" multiple />');
  $(window.document.body).append($inputFile);
  $inputFile.fileupload({
    url,
    dataType: 'json',
    forceIframeTransport: iframe,
    add: (e, data) => {
      data.process().done(() => {
        $.each(data.files, (index, { size, name }) => {
          const uuid = $.md5(createUUID()); // $.md5(file.name);
          const sizeMB = bytesToMB(size);
          const paramLink = `name=${name}&size=${sizeMB}&u=${myId}&k=${key}&key=${uuid}&p=qim_web`;
          const newUrl = `/file/v2/upload/file?${paramLink}`;
          if (size > limitFileSize) {
            alert('图片大小不能超过50M');
            return;
          }
          // 设置新的提交地址
          data.setSubmitURL(newUrl);
          // 校验上传的文件是否存在
          // 如果文件存在了就不上传了，直接显示为和上传成功的效果
          const checkFileUrl = `/file/v2/inspection/file?${paramLink}`;
          checkUpLoadFileExist(checkFileUrl)
            .done(async (res) => {
              beforeFn();
              if (res.ret) {
                data.submit();
              } else {
                let result = res.data; // 存在的文件URL地址
                if (iframe) {
                  result = $('pre', result).text();
                }
                const msg = {
                  FILEID: new Date().getTime(),
                  FILEMD5: '123',
                  FileName: name,
                  FileSize: bytesToSize(size),
                  HttpUrl: result
                };
                if (onlyUrl) {
                  successFn(result);
                } else {
                  // 发送消息
                  const ret = await this.sendMessage(JSON.stringify(msg), 5);
                  successFn(ret);
                }
                progressFn(100);
                $inputFile.remove();
              }
            });
        });
      });
    },
    done: async (e, data) => {
      let result = data.result.data;
      if (iframe) {
        result = $('pre', result).text();
      }
      if (data && data.files && data.files.length > 0) {
        const msg = {
          FILEID: new Date().getTime(),
          FILEMD5: '123',
          FileName: data.files[0].name,
          FileSize: bytesToSize(data.files[0].size),
          HttpUrl: result
        };
        if (onlyUrl) {
          successFn(result);
        } else {
          // 发送消息
          const ret = await this.sendMessage(JSON.stringify(msg), 5);
          successFn(ret);
        }
      }
      $inputFile.remove();
    },
    progress: (e, data) => {
      const progress = parseInt((data.loaded / data.total) * 100, 10);
      progressFn(progress);
    }
  });
  if (filesList && filesList.length > 0) {
    $inputFile.fileupload('add', { files: filesList });
  } else {
    $inputFile.trigger('click');
  }
}

export default {
  image,
  file
};
