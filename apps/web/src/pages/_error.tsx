import type { NextPageContext } from 'next';

interface ErrorProps {
  statusCode?: number;
}

function ErrorPage({ statusCode }: ErrorProps) {
  return (
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#060a13',
        color: '#e5e7eb',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '10px' }}>ResQRoute</h1>
        <p style={{ opacity: 0.8, marginBottom: '4px' }}>
          {statusCode ? `Error ${statusCode}` : 'An unexpected error occurred'}
        </p>
        <p style={{ opacity: 0.6 }}>Please retry, or return to home.</p>
      </div>
    </main>
  );
}

ErrorPage.getInitialProps = ({ res, err }: NextPageContext): ErrorProps => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 500;
  return { statusCode };
};

export default ErrorPage;
