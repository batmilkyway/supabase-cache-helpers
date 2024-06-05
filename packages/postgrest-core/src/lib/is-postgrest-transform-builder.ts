import { PostgrestTransformBuilder } from '@supabase/postgrest-js';
import { GenericSchema } from '@supabase/postgrest-js/dist/module/types';

export const isPostgrestTransformBuilder = <
  Schema extends GenericSchema,
  Row extends Record<string, unknown>,
  Result,
  RelationName = unknown,
  Relationships = unknown,
>(
  q: unknown,
): q is PostgrestTransformBuilder<
  Schema,
  Row,
  Result,
  RelationName,
  Relationships
> => {
  return (
    typeof (
      q as PostgrestTransformBuilder<
        Schema,
        Row,
        Result,
        RelationName,
        Relationships
      >
    ).abortSignal === 'function'
  );
};
