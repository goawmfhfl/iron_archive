import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <section className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-balance">
            기록을 통한 성장
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-text-secondary mb-6 sm:mb-8 max-w-2xl mx-auto text-balance">
            유익한 인사이트를 통해 함께 성장하는 플랫폼
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg">시작하기</Button>
            <Button variant="outline" size="lg">
              더 알아보기
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12">
          <Card elevation={2}>
            <CardHeader>
              <h3 className="text-xl font-semibold mb-2">기록</h3>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                매일의 경험과 학습을 체계적으로 기록하고 관리하세요.
              </p>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardHeader>
              <h3 className="text-xl font-semibold mb-2">성장</h3>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                기록을 분석하고 인사이트를 얻어 지속적으로 성장하세요.
              </p>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardHeader>
              <h3 className="text-xl font-semibold mb-2">공유</h3>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                유익한 인사이트를 공유하고 다른 사람들과 함께 성장하세요.
              </p>
            </CardContent>
          </Card>

          <Card elevation={2}>
            <CardHeader>
              <h3 className="text-xl font-semibold mb-2">학습</h3>
            </CardHeader>
            <CardContent>
              <p className="text-text-secondary">
                다양한 콘텐츠를 통해 새로운 지식과 경험을 쌓으세요.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Theme Toggle Demo */}
        <section className="text-center">
          <Card elevation={1}>
            <CardContent className="py-8">
              <div className="flex flex-col items-center gap-4">
                <p className="text-text-secondary">
                  다크모드를 지원합니다. 아래 버튼으로 테마를 변경해보세요.
                </p>
                <ThemeToggle />
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}

