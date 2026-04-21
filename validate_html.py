import html.parser

class HTMLValidator(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.tags = []
        self.errors = []
        self.ids = set()
        self.duplicates = set()

    def handle_starttag(self, tag, attrs):
        self.tags.append(tag)
        for attr, value in attrs:
            if attr == 'id':
                if value in self.ids:
                    self.duplicates.add(value)
                self.ids.add(value)

    def handle_endtag(self, tag):
        if not self.tags:
            self.errors.append(f"Unexpected end tag: </{tag}>")
            return
        last_tag = self.tags.pop()
        if last_tag != tag:
            self.errors.append(f"Mismatched tags: <{last_tag}> closed by </{tag}>")

def validate_file(filename):
    print(f"\nValidating {filename}:")
    validator = HTMLValidator()
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            validator.feed(f.read())
        
        if validator.tags:
            for tag in reversed(validator.tags):
                print(f"Error: Unclosed tag <{tag}>")
        
        for error in validator.errors:
            print(f"Error: {error}")
            
        if validator.duplicates:
            print(f"Error: Duplicate IDs found: {', '.join(validator.duplicates)}")
            
        if not validator.tags and not validator.errors and not validator.duplicates:
            print("OK")
    except Exception as e:
        print(f"Failed to read file: {e}")

validate_file('index.html')
validate_file('portfolio.html')
