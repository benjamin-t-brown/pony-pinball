const fs = require('fs');
const path = require('path');

// Since we're in a Node.js environment, we need to handle the TypeScript imports
// We'll use a simple approach by copying the necessary functions

// Import the parseEvents function and dependencies
// Note: This is a simplified approach - in a real scenario you might want to use ts-node or compile first

const ARG_DELIMITER = '|';
const CONDITION_DELIMITER = ',';

// Copy the startsWith function from eventParser.ts
const startsWith = (line, prefix) => {
  return line.startsWith(prefix);
};

// Copy the splitDelimTrim function from utils.ts
const splitDelimTrim = (str, delimiter) => {
  return str.split(delimiter).map(s => s.trim()).filter(s => s.length > 0);
};

// Copy the ParseContext type and functions from eventParser.ts
const parseEventString = (eventString) => {
  const context = {
    lines: splitDelimTrim(eventString.trim(), '\n').filter(
      line => line.length > 0
    ),
    currentLine: 0
  };

  const headerLine = context.lines[context.currentLine];
  if (!startsWith(headerLine, '#')) {
    throw new Error('Event must start with # followed by title and icon');
  }

  const headerMatch = headerLine.match(/^#(.+?),(.+)$/);
  if (!headerMatch) {
    throw new Error('Invalid header format. Expected: #Title,icon_name');
  }

  const title = headerMatch[1].trim();
  const icon = headerMatch[2].trim();
  context.currentLine++;

  const children = [];
  const event = {
    title,
    icon,
    children,
    vars: {},
  };
  
  while (context.currentLine < context.lines.length) {
    const child = parseChild(context, event);
    if (child) {
      children.push(child);
    }
  }

  return event;
};

const parseChild = (context, event) => {
  if (context.currentLine >= context.lines.length) {
    return null;
  }

  const line = context.lines[context.currentLine];

  if (startsWith(line, '@')) {
    const varMatch = line.match(/^(@.+)=(.+)$/);
    if (!varMatch) {
      throw new Error(`Invalid variable format: ${line}`);
    }
    const varName = varMatch[1].trim();
    const varValue = varMatch[2].trim();
    event.vars[varName] = {
      str: varValue,
      parsed: undefined,
    };
    context.currentLine++;
    return null;
  }

  if (!startsWith(line, '>')) {
    context.currentLine++;
    return null;
  }

  const childMatch = line.match(/^>([\d\w]+|[a-z]),(\w+):?$/);
  if (!childMatch) {
    throw new Error(
      `Invalid child format at line ${context.currentLine + 1}: ${line}`
    );
  }

  const id = childMatch[1];
  const type = childMatch[2];
  context.currentLine++;

  const child = { id, type };

  while (context.currentLine < context.lines.length) {
    const contentLine = context.lines[context.currentLine];

    if (startsWith(contentLine, '>')) {
      break;
    }

    if (startsWith(contentLine, '+p:')) {
      const text = contentLine.slice(3).trim();
      child.p = text;
    } else if (startsWith(contentLine, '+c:')) {
      if (child.type !== 'ch') {
        throw new Error(`Cannot add choice to non-choice child: ${child.id}`);
      }
      if (!child.choices) {
        child.choices = [];
      }
      const text = contentLine;
      const choice = parseChoice(text);
      child.choices.push(choice);
    } else if (startsWith(contentLine, '+d:')) {
      if (!child.rolls) {
        child.rolls = [];
      }
      const dice = parseDice(contentLine);
      child.rolls.push(...dice);
    } else if (startsWith(contentLine, '+pass:')) {
      const passNode = contentLine.slice(6).trim();
      child.pass = passNode;
    } else if (startsWith(contentLine, '+fail:')) {
      const failNode = contentLine.slice(6).trim();
      child.fail = failNode;
    } else if (
      startsWith(contentLine, '+add:') ||
      startsWith(contentLine, '+rem:')
    ) {
      if (!child.mod) {
        child.mod = [];
      }
      const resources = parseResources(contentLine);
      child.mod.push(...resources);
    } else if (startsWith(contentLine, '+n:')) {
      if (child.type === 'ch') {
        console.error(child, contentLine);
        throw new Error(`Cannot add next to choice child: ${child.id}`);
      }
      child.n = contentLine.slice(3).trim();
    }

    context.currentLine++;
  }

  return child;
};

const parseChoice = (choiceLine) => {
  const [n, text, conditionText] = splitDelimTrim(
    choiceLine.slice(3),
    ARG_DELIMITER
  );

  return {
    text,
    conditionText,
    n,
  };
};

const parseDice = (diceLine) => {
  const diceMatch = diceLine.match(/^\+d:(.+)$/);
  if (!diceMatch) {
    throw new Error(`Invalid dice format: ${diceLine}`);
  }

  const dicePart = diceMatch[1].trim();
  const diceStrings = splitDelimTrim(dicePart, ARG_DELIMITER);
  const rolls = [];

  for (const diceString of diceStrings) {
    const diceMatch = diceString.match(/^(.*)$/);
    if (!diceMatch) {
      throw new Error(`Invalid dice format string: ${diceString}`);
    }
    const resourceText = diceMatch[1];
    rolls.push(resourceText);
  }

  return rolls;
};

const parseResources = (resourceLine) => {
  const isAdd = startsWith(resourceLine, '+add:');
  const isRemove = startsWith(resourceLine, '+rem:');

  if (!isAdd && !isRemove) {
    throw new Error(`Invalid resource line: ${resourceLine}`);
  }

  const resourcePart = resourceLine.slice(isAdd ? 5 : 6).trim();

  const resourceStrings = splitDelimTrim(resourcePart, ARG_DELIMITER);
  const resources = [];

  for (const resourceString of resourceStrings) {
    const resourceMatch = resourceString.match(/^(.*)$/);
    if (!resourceMatch) {
      throw new Error(`Invalid resource format: ${resourceString}`);
    }

    const resourceText = resourceMatch[1];

    resources.push(isRemove ? '-' + resourceText : resourceText);
  }

  return resources;
};

const parseMultipleEvents = (eventsString) => {
  const events = [];

  const lines = eventsString.trim().split('\n');
  let currentEventLines = [];

  const _parseEvent = (eventString) => {
    try {
      const event = parseEventString(eventString);
      events.push(event);
    } catch (error) {
      console.warn('Failed to parse last event:', error);
    }
  };

  for (const line of lines) {
    const trimmedLine = line.trim();

    if (startsWith(trimmedLine, '#') && currentEventLines.length > 0) {
      const currentEventString = currentEventLines.join('\n');
      _parseEvent(currentEventString);
      currentEventLines = [trimmedLine];
    } else {
      currentEventLines.push(trimmedLine);
    }
  }

  if (currentEventLines.length > 0) {
    const lastEventString = currentEventLines.join('\n');
    _parseEvent(lastEventString);
  }

  return events;
};

// Main script logic
const generateEvents = () => {
  try {
    console.log('Reading events.wpe file...');
    
    // Read the events.wpe file
    const eventsWpePath = path.join(__dirname, '../public/events.wpe');
    const eventsTxt = fs.readFileSync(eventsWpePath, 'utf8');
    
    console.log('Parsing events...');
    
    // Parse the events (mimicking the main.ts logic)
    const parsedEvents = parseMultipleEvents(eventsTxt.replaceAll('\\n', '<br>'));
    
    console.log(`Parsed ${parsedEvents.length} events`);
    
    // Generate the events.js file
    const eventsJsPath = path.join(__dirname, '../events.js');
    const eventsJsContent = `// Generated events file
// This file is automatically generated by scripts/generate-events.js
// Do not edit manually

export const events = ${JSON.stringify(parsedEvents, null, 2)};
`;
    
    fs.writeFileSync(eventsJsPath, eventsJsContent);
    
    console.log(`Successfully generated ${eventsJsPath}`);
    console.log(`File size: ${fs.statSync(eventsJsPath).size} bytes`);
    
  } catch (error) {
    console.error('Error generating events.js:', error);
    process.exit(1);
  }
};

// Run the script
generateEvents();
