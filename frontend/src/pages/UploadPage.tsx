import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Button, Card, List, message, Row, Col, Spin } from 'antd';
import { InboxOutlined, FileImageOutlined } from '@ant-design/icons';
import { useMutation } from '@tanstack/react-query';
import { pdfjs } from 'react-pdf';
import { resumesApi } from '../lib/api';
import type { UploadResult } from '../types';
import type { UploadFile } from 'antd';

// 配置 PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const { Dragger } = Upload;


export const UploadPage: React.FC = () => {
  const [fileList, setFileList] = useState<File[]>([]);
  const [uploadResults, setUploadResults] = useState<UploadResult[]>([]);
  const [previews, setPreviews] = useState<Map<string, string>>(new Map());
  const [loadingPreviews, setLoadingPreviews] = useState<Set<string>>(new Set());
  // previews map: file.name -> data URL
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

      setPreviews(new Map());
      setFileList([]);
    },
    onError: () => {
      message.error('上传失败，请重试');
    },
  });

  // 生成 PDF 预览
  const generatePreview = async (file: File) => {
    setLoadingPreviews(prev => new Set(prev).add(file.name));

    try {
      const fileUrl = URL.createObjectURL(file);
      const pdf = await pdfjs.getDocument(fileUrl).promise;
      const page = await pdf.getPage(1);

      const viewport = page.getViewport({ scale: 0.5 });
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');

      canvas.width = viewport.width;
      canvas.height = viewport.height;

      if (context) {
        await page.render({
          canvasContext: context,
          viewport: viewport,
        }).promise;

        const preview = canvas.toDataURL('image/jpeg', 0.8);
        setPreviews(prev => new Map(prev).set(file.name, preview));
      }

      URL.revokeObjectURL(fileUrl);
    } catch (error) {
      console.error('生成预览失败:', error);
    } finally {
      setLoadingPreviews(prev => {
        const newSet = new Set(prev);
        newSet.delete(file.name);
        return newSet;
      });
    }
  };

  const beforeUpload = (file: File | UploadFile) => {
    const realFile = (file instanceof File) ? file : ((file as any).originFileObj as File);

    if (!realFile) {
      message.error('文件读取失败');
      return false;
    }

    const isPDF = realFile.type === 'application/pdf';
    if (!isPDF) {
      message.error('只能上传 PDF 文件！');
      return false;
    }

    const isLt10M = (realFile.size || 0) < 10 * 1024 * 1024;
    if (!isLt10M) {
      message.error('文件大小不能超过 10MB！');
      return false;
    }

    if (fileList.length >= 100) {
      message.error('最多只能上传 100 份简历！');
      return false;
    }

    setFileList((prev) => [...prev, realFile]);

    // 异步生成预览
    generatePreview(realFile);

    return false;
  };

  const handleRemove = (fileName: string) => {
    setPreviews(prev => { const m = new Map(prev); m.delete(fileName); return m; });
    setFileList((prev) => prev.filter((f) => f.name !== fileName));
  };

  const handleUpload = () => {
    if (fileList.length === 0) {
      message.warning('请先选择文件');
      return;
    }

    // 手动构建数组
    const filesToUpload: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      if (fileList[i] instanceof File) {
        filesToUpload.push(fileList[i]);
      }
    }

    uploadMutation.mutate(filesToUpload);
  };


  return (
    <div>
      <Card title="批量上传简历" style={{ marginBottom: 24 }}>
        <Dragger
          multiple
          accept=".pdf"
          showUploadList={false}
          beforeUpload={beforeUpload}
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
          <div style={{ marginTop: 24 }}>
            <h4>待上传文件（{fileList.length}）：</h4>
            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
              {fileList.map((file) => (
                <Col xs={24} sm={12} md={8} lg={6} key={file.name}>
                  <Card
                    size="small"
                    cover={
                      <div style={{
                        height: 200,
                        background: '#f5f5f5',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        position: 'relative'
                      }}>
                        {loadingPreviews.has(file.name) ? (
                          <Spin description="生成预览..." />
                        ) : previews.get(file.name) ? (
                          <img
                            src={previews.get(file.name)}
                            alt={file.name}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                          />
                        ) : (
                          <FileImageOutlined style={{ fontSize: 48, color: '#ccc' }} />
                        )}
                      </div>
                    }
                    actions={[
                      <Button
                        type="link"
                        size="small"
                        danger
                        onClick={() => handleRemove(file.name)}
                      >
                        移除
                      </Button>,
                    ]}
                  >
                    <Card.Meta
                      title={
                        <div style={{
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {file.name}
                        </div>
                      }
                      description={`${(file.size / 1024).toFixed(1)} KB`}
                    />
                  </Card>
                </Col>
              ))}
            </Row>
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
