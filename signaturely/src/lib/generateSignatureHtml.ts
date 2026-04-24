import { SignatureData } from './types';

const socialIcons: Record<string, string> = {
  linkedin: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>',
  twitter: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>',
  facebook: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>',
  instagram: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678a6.162 6.162 0 100 12.324 6.162 6.162 0 100-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.88 0 1.441 1.441 0 012.88 0z"/></svg>',
  github: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>',
  youtube: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>',
  tiktok: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>',
  dribbble: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M12 24C5.385 24 0 18.615 0 12S5.385 0 12 0s12 5.385 12 12-5.385 12-12 12zm10.12-10.358c-.35-.11-3.17-.953-6.384-.438 1.34 3.684 1.887 6.684 1.992 7.308 2.3-1.555 3.936-4.02 4.395-6.87zm-6.115 7.808c-.153-.9-.75-4.032-2.19-7.77l-.066.02c-5.79 2.015-7.86 6.025-8.04 6.4 1.73 1.358 3.92 2.166 6.29 2.166 1.42 0 2.77-.29 4-.816zm-11.62-2.58c.232-.4 3.045-5.055 8.332-6.765.135-.045.27-.084.405-.12-.26-.585-.54-1.167-.832-1.74C7.17 11.775 2.206 11.71 1.756 11.7l-.004.312c0 2.633.998 5.037 2.634 6.855zm-2.42-8.955c.46.008 4.683.026 9.477-1.248-1.698-3.018-3.53-5.558-3.8-5.928-2.868 1.35-5.01 3.99-5.676 7.17zM9.6 2.052c.282.38 2.145 2.914 3.822 6 3.645-1.365 5.19-3.44 5.373-3.702C16.86 2.61 14.545 1.62 12 1.62c-.8 0-1.58.1-2.34.28l-.06.15zm10.335 3.483c-.218.29-1.91 2.493-5.724 4.04.24.49.47.985.68 1.486.08.18.15.36.22.53 3.41-.43 6.8.26 7.14.33-.02-2.42-.88-4.64-2.31-6.38z"/></svg>',
  behance: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.63.165-1.27.25-1.95.25H0V4.51h6.938v-.007zM6.545 10.16c.57 0 1.053-.15 1.435-.44.382-.29.573-.75.573-1.37 0-.35-.06-.64-.188-.87-.13-.23-.3-.41-.527-.54-.224-.13-.48-.22-.763-.27-.29-.05-.6-.07-.93-.07H3.263v3.56h3.282zm.18 5.56c.36 0 .698-.04 1.013-.12.315-.08.588-.2.816-.37.228-.17.408-.39.54-.66.13-.27.197-.6.197-.99 0-.79-.22-1.35-.66-1.7-.44-.35-1.012-.52-1.727-.52H3.264v4.36h3.46zm10.166-3.55c-.145-.508-.36-.95-.65-1.33-.29-.38-.65-.67-1.09-.87-.44-.2-.97-.3-1.56-.3-.6 0-1.11.1-1.57.3-.45.2-.82.49-1.12.87-.29.38-.52.82-.67 1.33-.15.51-.23 1.07-.23 1.66 0 .58.08 1.13.23 1.63.15.5.37.94.67 1.32.3.37.67.67 1.12.87.46.2.97.3 1.57.3.84 0 1.55-.24 2.12-.71.57-.47.94-1.14 1.12-2.01h2.91c-.12.88-.39 1.65-.8 2.31-.42.66-.93 1.21-1.55 1.65-.62.44-1.3.76-2.05.97-.75.21-1.54.31-2.37.31-1.08 0-2.04-.18-2.9-.55-.87-.37-1.6-.88-2.2-1.53-.59-.65-1.05-1.42-1.37-2.31-.32-.89-.48-1.86-.48-2.92 0-1.03.16-1.99.48-2.88.32-.89.78-1.66 1.37-2.32.59-.66 1.32-1.17 2.2-1.55.87-.37 1.84-.56 2.9-.56.87 0 1.68.14 2.44.41.76.28 1.42.68 1.99 1.22.57.53 1.03 1.19 1.37 1.95.33.77.52 1.65.56 2.65h-8.6c.01.63.1 1.2.25 1.72z"/></svg>',
  pinterest: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.668.967-2.914 2.171-2.914 1.023 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12.017 24c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001 12.017.001z"/></svg>',
  discord: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>',
  whatsapp: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
  telegram: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M11.944 0A12 12 0 000 12a12 12 0 0012 12 12 12 0 0012-12A12 12 0 0012 0a12 12 0 00-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 01.171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>',
  medium: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/></svg>',
  substack: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812H1.46zM22.54 0H1.46v2.836h21.08V0z"/></svg>',
  snapchat: '<svg xmlns="http://www.w3.org/2000/svg" width="SIZE" height="SIZE" viewBox="0 0 24 24" fill="FILL"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12.922-.214.095-.03.196-.046.3-.046.417 0 .841.22.841.614 0 .404-.351.644-.705.805-.358.165-1.197.386-1.394.584-.204.199-.18.521-.18.521s.519 3.442 3.252 3.793c.3.075.45.225.45.375 0 .396-.555.616-.96.735-.405.12-.854.181-1.069.271-.21.09-.375.271-.375.271s-.184.345-.481.645c-.3.3-.66.479-1.426.479-.755 0-1.26-.12-1.951-.345-.69-.225-1.276-.21-1.514-.21h-.001c-.239 0-.825-.015-1.515.21-.69.225-1.196.345-1.95.345-.766 0-1.125-.18-1.426-.479-.3-.3-.48-.645-.48-.645s-.165-.18-.375-.271c-.216-.09-.665-.15-1.07-.271-.405-.12-.96-.34-.96-.735 0-.15.15-.3.45-.375 2.733-.35 3.252-3.793 3.252-3.793s.024-.321-.18-.521c-.197-.198-1.036-.419-1.394-.584-.354-.161-.705-.401-.705-.805 0-.394.424-.614.84-.614.105 0 .206.015.3.046.264.095.623.214.923.214.198 0 .326-.045.4-.09-.007-.165-.018-.33-.03-.51l-.003-.06c-.104-1.628-.23-3.654.3-4.847C7.86 1.069 11.216.793 12.206.793z"/></svg>',
};

const socialColors: Record<string, string> = {
  linkedin: '#0A66C2', twitter: '#000000', facebook: '#1877F2', instagram: '#E4405F',
  tiktok: '#000000', youtube: '#FF0000', github: '#181717', dribbble: '#EA4C89',
  behance: '#1769FF', pinterest: '#BD081C', snapchat: '#FFFC00', discord: '#5865F2',
  whatsapp: '#25D366', telegram: '#26A5E4', medium: '#000000', substack: '#FF6719',
};

function getSeparator(type: string): string {
  switch (type) {
    case 'pipe': return ' | ';
    case 'dot': return ' &middot; ';
    case 'line': return ' &mdash; ';
    default: return ' ';
  }
}

function getIconSize(size: string): number {
  switch (size) {
    case 'small': return 16;
    case 'large': return 24;
    default: return 20;
  }
}

function getBorderRadius(shape: string): string {
  switch (shape) {
    case 'circle': return '50%';
    case 'rounded': return '4px';
    default: return '0';
  }
}

export function generateSignatureHtml(data: SignatureData, includeBranding: boolean = true): string {
  const { personal, images, social, design, addons } = data;
  const sep = getSeparator(design.separator);
  const iconPx = getIconSize(design.iconSize);
  const photoRadius = getBorderRadius(images.photoShape);

  const socialHtml = social
    .filter((s) => s.url)
    .map((s) => {
      const fill = design.iconStyle === 'colored' ? (socialColors[s.platform] || design.primaryColor) : design.iconStyle === 'monochrome' ? design.textColor : 'none';
      const icon = (socialIcons[s.platform] || '')
        .replace(/SIZE/g, String(iconPx))
        .replace(/FILL/g, fill);
      const iconBorderRadius = getBorderRadius(design.iconShape);
      return `<a href="${s.url}" target="_blank" style="text-decoration:none;margin-right:6px;display:inline-block;border-radius:${iconBorderRadius};overflow:hidden;">${icon}</a>`;
    })
    .join('');

  const contactParts: string[] = [];
  if (personal.email) contactParts.push(`<a href="mailto:${personal.email}" style="color:${design.primaryColor};text-decoration:none;font-size:${design.fontSize.info}px;font-family:${design.fontFamily},sans-serif;">${personal.email}</a>`);
  if (personal.phone) contactParts.push(`<span style="color:${design.textColor};font-size:${design.fontSize.info}px;font-family:${design.fontFamily},sans-serif;">${personal.phone}</span>`);
  if (personal.mobile) contactParts.push(`<span style="color:${design.textColor};font-size:${design.fontSize.info}px;font-family:${design.fontFamily},sans-serif;">${personal.mobile}</span>`);
  if (personal.website) contactParts.push(`<a href="${personal.website}" style="color:${design.primaryColor};text-decoration:none;font-size:${design.fontSize.info}px;font-family:${design.fontFamily},sans-serif;">${personal.website.replace(/^https?:\/\//, '')}</a>`);

  const contactLine = contactParts.join(sep);

  const photoHtml = images.photo
    ? `<img src="${images.photo}" width="${images.photoSize}" height="${images.photoSize}" style="border-radius:${photoRadius};display:block;object-fit:cover;" alt="${personal.fullName}" />`
    : '';

  const logoHtml = images.logo
    ? `<img src="${images.logo}" width="${images.logoSize}" style="display:block;margin-top:8px;" alt="Logo" />`
    : '';

  const ctaHtml = addons.cta.enabled && addons.cta.text
    ? `<tr><td style="padding-top:10px;"><a href="${addons.cta.url}" style="display:inline-block;padding:8px 18px;background-color:${addons.cta.color};color:#ffffff;text-decoration:none;border-radius:4px;font-size:${design.fontSize.info}px;font-family:${design.fontFamily},sans-serif;font-weight:600;">${addons.cta.text}</a></td></tr>`
    : '';

  const bannerHtml = addons.banner.enabled && addons.banner.image
    ? `<tr><td style="padding-top:10px;"><a href="${addons.banner.url || '#'}" target="_blank"><img src="${addons.banner.image}" style="max-width:400px;width:100%;display:block;border-radius:4px;" alt="Banner" /></a></td></tr>`
    : '';

  const taglineHtml = addons.tagline.enabled && addons.tagline.text
    ? `<tr><td style="padding-top:6px;font-style:italic;color:${design.textColor};opacity:0.7;font-size:${design.fontSize.info}px;font-family:${design.fontFamily},sans-serif;">"${addons.tagline.text}"</td></tr>`
    : '';

  const disclaimerHtml = addons.disclaimer.enabled && addons.disclaimer.text
    ? `<tr><td style="padding-top:10px;font-size:9px;color:#9ca3af;font-family:${design.fontFamily},sans-serif;max-width:400px;">${addons.disclaimer.text}</td></tr>`
    : '';

  const brandingHtml = includeBranding
    ? `<tr><td style="padding-top:10px;font-size:9px;color:#d1d5db;font-family:${design.fontFamily},sans-serif;"><a href="#" style="color:#d1d5db;text-decoration:none;">Made with AutoSig</a></td></tr>`
    : '';

  // Generate based on template style
  const accentBar = ['bold', 'creative', 'startup'].includes(design.template)
    ? `style="border-left:3px solid ${design.primaryColor};padding-left:12px;"`
    : '';

  const nameStyle = `font-size:${design.fontSize.name}px;font-weight:700;color:${design.textColor};font-family:${design.fontFamily},sans-serif;margin:0;line-height:1.3;`;
  const titleStyle = `font-size:${design.fontSize.title}px;color:${design.textColor};font-family:${design.fontFamily},sans-serif;margin:0;line-height:1.4;`;
  const companyStyle = `font-size:${design.fontSize.company}px;color:${design.primaryColor};font-weight:600;font-family:${design.fontFamily},sans-serif;margin:0;line-height:1.4;`;

  if (design.layout === 'vertical' || design.template === 'compact' || design.template === 'minimal') {
    return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:${design.fontFamily},sans-serif;color:${design.textColor};">
      ${photoHtml ? `<tr><td style="padding-bottom:10px;">${photoHtml}</td></tr>` : ''}
      <tr><td><table cellpadding="0" cellspacing="0" border="0" ${accentBar}>
        <tr><td style="${nameStyle}">${personal.fullName || 'Your Name'}</td></tr>
        ${personal.jobTitle ? `<tr><td style="${titleStyle}">${personal.jobTitle}${personal.department ? ` — ${personal.department}` : ''}</td></tr>` : ''}
        ${personal.company ? `<tr><td style="${companyStyle}">${personal.company}</td></tr>` : ''}
        <tr><td style="padding-top:6px;">${contactLine}</td></tr>
        ${personal.address ? `<tr><td style="font-size:${design.fontSize.info}px;color:${design.textColor};font-family:${design.fontFamily},sans-serif;padding-top:2px;">${personal.address}</td></tr>` : ''}
        ${socialHtml ? `<tr><td style="padding-top:8px;">${socialHtml}</td></tr>` : ''}
        ${taglineHtml}${ctaHtml}${bannerHtml}${disclaimerHtml}${brandingHtml}
      </table></td></tr>
    </table>`;
  }

  // Default: horizontal layout
  return `<table cellpadding="0" cellspacing="0" border="0" style="font-family:${design.fontFamily},sans-serif;color:${design.textColor};">
    <tr>
      ${photoHtml ? `<td style="vertical-align:top;padding-right:14px;">${photoHtml}${logoHtml}</td>` : ''}
      <td style="vertical-align:top;${['bold', 'creative', 'startup'].includes(design.template) ? `border-left:3px solid ${design.primaryColor};padding-left:14px;` : ''}">
        <table cellpadding="0" cellspacing="0" border="0">
          <tr><td style="${nameStyle}">${personal.fullName || 'Your Name'}</td></tr>
          ${personal.jobTitle ? `<tr><td style="${titleStyle}">${personal.jobTitle}${personal.department ? ` — ${personal.department}` : ''}</td></tr>` : ''}
          ${personal.company ? `<tr><td style="${companyStyle}">${personal.company}</td></tr>` : ''}
          <tr><td style="border-bottom:1px solid ${design.primaryColor}22;padding:6px 0;"></td></tr>
          <tr><td style="padding-top:6px;">${contactLine}</td></tr>
          ${personal.address ? `<tr><td style="font-size:${design.fontSize.info}px;color:${design.textColor};font-family:${design.fontFamily},sans-serif;padding-top:2px;">${personal.address}</td></tr>` : ''}
          ${socialHtml ? `<tr><td style="padding-top:8px;">${socialHtml}</td></tr>` : ''}
          ${taglineHtml}${ctaHtml}${bannerHtml}${disclaimerHtml}${brandingHtml}
        </table>
      </td>
    </tr>
  </table>`;
}
