
export class File {
    constructor({ id, filename, aws3_key, file_size, user_id, mime_type, uploaded_at }) {
      this.id = id;
      this.filename = filename;
      this.aws3_key = aws3_key;
      this.file_size = file_size;
      this.user_id = user_id;
      this.mime_type = mime_type;
      this.uploaded_at = uploaded_at;
    }
  }