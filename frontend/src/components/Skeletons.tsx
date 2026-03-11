import { Skeleton, Card } from 'antd';

export const CandidateListSkeleton = () => {
  return (
    <>
      {[1, 2, 3, 4, 5].map((i) => (
        <Card key={i} style={{ marginBottom: 16 }}>
          <Skeleton active avatar paragraph={{ rows: 2 }} />
        </Card>
      ))}
    </>
  );
};

export const CandidateDetailSkeleton = () => {
  return (
    <div>
      <Card style={{ marginBottom: 16 }}>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
      <Card style={{ marginBottom: 16 }}>
        <Skeleton active paragraph={{ rows: 6 }} />
      </Card>
      <Card>
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    </div>
  );
};

export const TableSkeleton = () => {
  return (
    <Card>
      <Skeleton active paragraph={{ rows: 10 }} />
    </Card>
  );
};
