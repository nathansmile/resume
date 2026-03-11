import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Button, Card, List, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { resumesApi } from '../lib/api';
import type { UploadResult } from '../types';
import type { UploadFile } from 'antd';

const { Dragger } = Upload;

export const UploadPage: React.FC = () => {
  const [fileList, setFileList] = useState<File[]>([]);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const navigate = useNavigate();

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => resumesApi.upload(files),
    onSuccess: (response) => {
      const results = response.data.results || [];
      setUploadResults(results);
      
      const successCount = results.filter((r: UploadResult) => r.success).length;
      const failCount = results.filter((r: UploadResult) => !r.success).length;
      
      if (successCount > 0) {
        message.success(`成功上传 ${successCount} 份简历`);
      }
      if (failCount > 0) {
        message.error(`${failCount} 份简历上传失败`);
      }
      
      setFileList([]);
    },
    onError: () => {
      message.error('上传失败，请重试');
    },
  });

  const beforeUpload = (file: UploadFile) => {
    const isPDF = file.type === 'application/pdf';
    if (!isPDF) {
      message.error('只能上传 PDF 文件！');
      return false;
    }

    const isLt10M = (file.size || 0) < 10 * 1024 * 1024;
    if (!isLt10M) {
      message.error('文件大小不能超过 10MB！');
      return false;
    }

    if (fileList.length >= 100) {
      message.error('最多只能上传 100 份简历！');
      return false;
    }

    setFileList((prev) => [...prev, file as any as File]);
    return false;
  };

  const handleRemove = (file: UploadFile) => {
    setFileList((prev) => prev.filter((f) => f.name !== file.name));
  };

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.warning('请先选择文件');
      return;
    }

    uploadMutation.mutate(fileList);
  };

  return (
    <div>
      <Card title="批量上传简历" style={{ marginBottom: 24 }}>
        <Dragger
          multiple
          accept=".pdf"
          showUploadList={false}
          beforeUpload={beforeUpload}
          onRemove={handleRemove}
          fileList={fileList.map((f) => ({ uid: f.name, name: f.name, status: 'done' as const }))}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
          <p className="ant-upload-hint">
            支持批量上传，最多同时上传 100 份简历。仅支持 PDF 格式，单个文件不超过 10MB。
          </p>
        </Dragger>

        <div style={{ marginTop: 16, textAlign: 'center' }}>
          <Button
            type="primary"
            size="large"
            onClick={handleUpload}
            loading={uploadMutation.isPending}
            disabled={fileList.length === 0}
          >
            开始上传 ({fileList.length} 份)
          </Button>
        </div>

        {fileList.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <h4>待上传文件：</h4>
            <List
              size="small"
              dataSource={fileList}
              renderItem={(file) => (
                <List.Item
                  actions={[
                    <Button type="link" size="small" onClick={() => handleRemove({ uid: file.name, name: file.name } as UploadFile)}>
                      移除
                    </Button>,
                  ]}
                >
                  {file.name}
                </List.Item>
              )}
            />
          </div>
        )}
      </Card>

      {uploadResults.length > 0 && (
        <Card title="上传结果">
          <List
            dataSource={uploadResults}
            renderItem={(item) => (
              <List.Item
                actions={
                  item.success
                    ? [
                        <Button
                          type="link"
                          onClick={() => navigate(`/candidates/${item.data?.id}`)}
                        >
                          查看详情
                        </Button>,
                      ]
                    : []
                }
              >
                <List.Item.Meta
                  title={
                    <span>
                      {item.filename}{' '}
                      <span style={{ color: item.success ? 'green' : 'red' }}>
                        {item.success ? '✓ 成功' : '✗ 失败'}
                      </span>
                    </span>
                  }
                  description={
                    item.success
                      ? `候选人: ${item.data?.name}`
                      : `错误: ${item.error}`
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      )}
    </div>
  );
};
