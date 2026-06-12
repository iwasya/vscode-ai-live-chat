export type YouClientOptions = {
  apiKey: string;
  apiBaseUrl?: string;
  model?: string;
  timeoutMs?: number;
};

type ApiResponse = {
  output?: {
    content?: string;
    answer?: string;
    text?: string;
  };
  choices?: Array<{
    message?: {
      content?: string | Array<{ type?: string; text?: string }>;
    };
    text?: string;
  }>;
  candidates?: Array<{
    content?: {
      parts?: Array<{ text?: string }>;
    };
  }>;
  content?: string;
  answer?: string;
  text?: string;
  error?: {
    message?: string;
  };
  message?: string;
};

export class YouClient {
  private readonly apiKey: string;
  private readonly apiBaseUrl: string;
  private readonly model: string;
  private readonly timeoutMs: number;

  constructor(options: YouClientOptions) {
    this.apiKey = options.apiKey;
    this.apiBaseUrl = normalizeBaseUrl(options.apiBaseUrl ?? 'https://api.you.com/v1/research');
    this.model = options.model?.trim() || 'research';
    this.timeoutMs = options.timeoutMs ?? 60000;
  }

  async research(input: string): Promise<string> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(this.getEndpoint(), this.buildRequest(input, controller.signal));

      const rawText = await response.text();
      const data = this.parseResponse(rawText);

      if (!response.ok) {
        throw new Error(this.toFriendlyHttpError(response.status, data));
      }

      const answer = extractAnswer(data);
      if (!answer || !answer.trim()) {
        throw new Error('Tidak ada jawaban dari API.');
      }

      return answer.trim();
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Request terlalu lama. Coba lagi dengan konteks yang lebih pendek.');
      }

      if (error instanceof TypeError) {
        throw new Error('Gagal terhubung ke AI API. Periksa base URL, koneksi internet, dan format endpoint provider.');
      }

      throw error;
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildRequest(input: string, signal: AbortSignal): RequestInit {
    if (this.isYouResearchEndpoint()) {
      return {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.apiKey
        },
        body: JSON.stringify({
          input,
          research_effort: 'standard'
        }),
        signal
      };
    }

    return {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: 'user',
            content: input
          }
        ],
        stream: false
      }),
      signal
    };
  }

  private getEndpoint(): string {
    if (this.isYouResearchEndpoint() || /\/chat\/completions$/i.test(this.apiBaseUrl)) {
      return this.apiBaseUrl;
    }

    return `${this.apiBaseUrl}/chat/completions`;
  }

  private isYouResearchEndpoint(): boolean {
    return /api\.you\.com\/v1\/research\/?$/i.test(this.apiBaseUrl);
  }

  private parseResponse(rawText: string): ApiResponse {
    if (!rawText.trim()) {
      return {};
    }

    try {
      return JSON.parse(rawText) as ApiResponse;
    } catch {
      return { text: rawText };
    }
  }

  private toFriendlyHttpError(status: number, data: ApiResponse): string {
    const apiMessage = data.error?.message ?? data.message;

    if (status === 401 || status === 403) {
      return 'API key tidak valid atau tidak memiliki akses.';
    }

    if (status === 429) {
      return 'Limit request API tercapai. Coba lagi nanti.';
    }

    if (apiMessage) {
      return apiMessage;
    }

    return `Request AI API gagal dengan status ${status}.`;
  }
}

function normalizeBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

function extractAnswer(data: ApiResponse): string | undefined {
  const openAiContent = data.choices?.[0]?.message?.content;
  if (typeof openAiContent === 'string') {
    return openAiContent;
  }

  if (Array.isArray(openAiContent)) {
    return openAiContent
      .map((part) => part.text)
      .filter(Boolean)
      .join('\n');
  }

  return data.output?.content
    ?? data.output?.answer
    ?? data.output?.text
    ?? data.choices?.[0]?.text
    ?? data.candidates?.[0]?.content?.parts?.map((part) => part.text).filter(Boolean).join('\n')
    ?? data.content
    ?? data.answer
    ?? data.text;
}
