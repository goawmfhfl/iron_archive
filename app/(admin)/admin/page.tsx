import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">
          관리자 대시보드
        </h1>
        <p className="text-text-secondary">
          ironArchive 관리자 페이지에 오신 것을 환영합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card elevation={2}>
          <CardHeader>
            <h3 className="text-lg font-semibold">콘텐츠</h3>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary mb-2">0</p>
            <p className="text-sm text-text-secondary">전체 콘텐츠</p>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardHeader>
            <h3 className="text-lg font-semibold">조회수</h3>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary mb-2">0</p>
            <p className="text-sm text-text-secondary">전체 조회수</p>
          </CardContent>
        </Card>

        <Card elevation={2}>
          <CardHeader>
            <h3 className="text-lg font-semibold">사용자</h3>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-text-primary mb-2">0</p>
            <p className="text-sm text-text-secondary">전체 사용자</p>
          </CardContent>
        </Card>
      </div>

      <Card elevation={1}>
        <CardHeader>
          <h2 className="text-xl font-semibold">최근 활동</h2>
        </CardHeader>
        <CardContent>
          <p className="text-text-secondary">아직 활동이 없습니다.</p>
        </CardContent>
      </Card>
    </div>
  );
}

