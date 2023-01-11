 function getQueryErrorLine(query: string, err: any) {
  
  const line = ((query.substring(0, err.position).match(/\n/g) || []).length + 1);

  return line;
}

export default getQueryErrorLine;